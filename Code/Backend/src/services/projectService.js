const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');
const Task = require('../models/Task');
const notificationService = require('./notificationService');

const PROJECT_SAFE_ATTRIBUTES = [
    'id',
    'name',
    'description',
    'status',
    'start_date',
    'end_date',
    'manager_id',
    'created_by',
    'updated_by',
    'created_at',
    'updated_at'
];

const USER_SAFE_ATTRIBUTES = ['id', 'full_name', 'email', 'role', 'status', 'department_id'];
const PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
const PROJECT_MEMBER_ROLES = ['MEMBER', 'LEAD', 'REVIEWER'];

class ProjectService {
    buildProjectWhere(filters, currentUser, allowedProjectIds = []) {
        const where = { is_deleted: false };

        if (filters.search) {
            const keyword = `%${filters.search}%`;
            where[Op.or] = [
                { name: { [Op.like]: keyword } },
                { description: { [Op.like]: keyword } }
            ];
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.manager_id) {
            where.manager_id = filters.manager_id;
        }

        if (currentUser.role === 'PM') {
            where[Op.and] = [
                ...(where[Op.and] || []),
                {
                    [Op.or]: [
                        { manager_id: currentUser.id },
                        { id: { [Op.in]: allowedProjectIds } }
                    ]
                }
            ];
        }

        if (currentUser.role === 'MEMBER') {
            where.id = { [Op.in]: allowedProjectIds };
        }

        return where;
    }

    // Đếm task theo project_id + status (bỏ qua task đã xóa mềm và task CANCELED)
    // để tính % hoàn thành. Dùng 1 query group-by duy nhất để tránh N+1.
    async getProjectsTaskStats(projectIds) {
        if (!projectIds.length) {
            return {};
        }

        const rows = await Task.findAll({
            attributes: [
                'project_id',
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                project_id: { [Op.in]: projectIds },
                is_deleted: false,
                status: { [Op.ne]: 'CANCELED' }
            },
            group: ['project_id', 'status'],
            raw: true
        });

        const stats = {};

        rows.forEach((row) => {
            const projectId = row.project_id;

            if (!stats[projectId]) {
                stats[projectId] = { total: 0, done: 0 };
            }

            const count = Number(row.count);

            stats[projectId].total += count;

            if (row.status === 'DONE') {
                stats[projectId].done += count;
            }
        });

        return stats;
    }

    calculateProgressPercent(stat) {
        if (!stat || !stat.total) {
            return 0;
        }

        return Math.round((stat.done / stat.total) * 100);
    }

    // Gắn field "progress" (%) vào 1 project hoặc mảng project.
    // progress = số task DONE / tổng số task hợp lệ của project * 100.
    async attachProgress(projectOrProjects) {
        const list = Array.isArray(projectOrProjects) ? projectOrProjects : [projectOrProjects];
        const projectIds = list.map((project) => project.id);
        const stats = await this.getProjectsTaskStats(projectIds);

        list.forEach((project) => {
            project.dataValues.progress = this.calculateProgressPercent(stats[project.id]);
        });

        return projectOrProjects;
    }

    async getActiveMembershipProjectIds(userId) {
        const memberships = await ProjectMember.findAll({
            where: {
                user_id: userId,
                is_active: true
            },
            attributes: ['project_id']
        });

        return memberships.map((membership) => membership.project_id);
    }

    async getProjects(filters, currentUser) {
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const offset = Math.max((page - 1) * limit, 0);
        const allowedProjectIds = currentUser.role === 'ADMIN'
            ? []
            : await this.getActiveMembershipProjectIds(currentUser.id);
        const where = this.buildProjectWhere(filters, currentUser, allowedProjectIds);

        const { rows, count } = await Project.findAndCountAll({
            where,
            attributes: PROJECT_SAFE_ATTRIBUTES,
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: USER_SAFE_ATTRIBUTES,
                    required: false
                },
                {
                    model: ProjectMember,
                    as: 'members',
                    required: false,
                    where: { is_active: true },
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: USER_SAFE_ATTRIBUTES
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        await this.attachProgress(rows);

        return {
            projects: rows,
            pagination: {
                page,
                limit,
                totalItems: count,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async getProjectById(id, currentUser) {
        const project = await Project.findByPk(id, {
            attributes: PROJECT_SAFE_ATTRIBUTES,
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: USER_SAFE_ATTRIBUTES,
                    required: false
                },
                {
                    model: ProjectMember,
                    as: 'members',
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: USER_SAFE_ATTRIBUTES
                        }
                    ]
                }
            ]
        });

        if (!project) {
            throw this.createError('Không tìm thấy project.', 404);
        }

        await this.ensureCanViewProject(project.id, project.manager_id, currentUser);

        await this.attachProgress(project);

        return project;
    }

    async createProject(projectData, currentUser) {
        if (!['ADMIN', 'PM'].includes(currentUser.role)) {
            throw this.createError('Bạn không có quyền tạo project.', 403);
        }

        const payload = this.pickSafeProjectData(projectData);

        if (currentUser.role === 'PM') {
            payload.manager_id = currentUser.id;
        }

        if (payload.manager_id) {
            await this.ensureValidManager(payload.manager_id);
        }

        this.ensureDateRange(payload.start_date, payload.end_date);

        const project = await Project.create({
            ...payload,
            status: payload.status || 'ACTIVE',
            created_by: currentUser.id,
            updated_by: currentUser.id
        });

        if (project.manager_id) {
            await this.addOrReactivateProjectMember(project.id, {
                user_id: project.manager_id,
                role: 'LEAD',
                added_by: currentUser.id
            }, true);
        }

        // Notify admins about new project
        this.notifyAllAdmins(
            currentUser.id,
            'PROJECT_CREATED',
            `Dự án mới: ${project.name}`,
            `${currentUser.full_name} đã tạo dự án mới`,
            { projectId: project.id, projectName: project.name, createdBy: currentUser.full_name }
        );

        notificationService.broadcastAdminUpdate().catch(console.error);

        return this.getProjectById(project.id, currentUser);
    }

    // Helper: broadcast notification to all admins
    async notifyAllAdmins(actorId, type, title, content, payload) {
        try {
            const admins = await User.findAll({
                where: { role: 'ADMIN', status: 'ACTIVE' },
                attributes: ['id']
            });
            for (const admin of admins) {
                if (Number(admin.id) === Number(actorId)) continue;
                notificationService.createNotification(admin.id, type, title, content, payload).catch(console.error);
            }
            notificationService.broadcastAdminUpdate().catch(console.error);
        } catch (error) {
            console.error('notifyAllAdmins error:', error);
        }
    }

    // Helper: broadcast notification to all active project members (except actor)
    async notifyAllProjectMembers(projectId, actorId, type, title, content, payload) {
        try {
            const members = await ProjectMember.findAll({
                where: { project_id: projectId, is_active: true },
                attributes: ['user_id']
            });
            for (const m of members) {
                if (Number(m.user_id) === Number(actorId)) continue;
                notificationService.createNotification(m.user_id, type, title, content, payload).catch(console.error);
            }
        } catch (error) {
            console.error('notifyAllProjectMembers error:', error);
        }
    }

    async updateProject(id, updateData, currentUser) {
        const project = await Project.findByPk(id);

        if (!project) {
            throw this.createError('Không tìm thấy project.', 404);
        }

        await this.ensureCanManageProject(project, currentUser);

        const safeUpdateData = this.pickSafeProjectData(updateData);

        if (currentUser.role === 'PM' && Object.prototype.hasOwnProperty.call(safeUpdateData, 'manager_id')) {
            throw this.createError('PM không được chuyển manager của project.', 403);
        }

        if (safeUpdateData.manager_id) {
            await this.ensureValidManager(safeUpdateData.manager_id);
        }

        this.ensureDateRange(
            safeUpdateData.start_date || project.start_date,
            safeUpdateData.end_date || project.end_date
        );

        await project.update({
            ...safeUpdateData,
            updated_by: currentUser.id
        });

        if (safeUpdateData.manager_id) {
            await this.addOrReactivateProjectMember(project.id, {
                user_id: safeUpdateData.manager_id,
                role: 'LEAD',
                added_by: currentUser.id
            }, true);
        }

        // Notify all members about project update
        this.notifyAllProjectMembers(
            project.id,
            currentUser.id,
            'PROJECT_UPDATED',
            `Dự án được cập nhật: ${project.name}`,
            `${currentUser.full_name} vừa cập nhật thông tin dự án`,
            { projectId: project.id, projectName: project.name, updatedBy: currentUser.full_name }
        );

        // Ensure PM is notified if Admin updates the project and PM is somehow not an active member
        if (currentUser.role === 'ADMIN' && project.manager_id && Number(project.manager_id) !== Number(currentUser.id)) {
            const isMemberActive = await ProjectMember.findOne({
                where: { project_id: project.id, user_id: project.manager_id, is_active: true }
            });
            if (!isMemberActive) {
                notificationService.createNotification(
                    project.manager_id,
                    'PROJECT_UPDATED',
                    `Dự án được cập nhật: ${project.name}`,
                    `${currentUser.full_name} vừa cập nhật thông tin dự án`,
                    { projectId: project.id, projectName: project.name, updatedBy: currentUser.full_name }
                ).catch(console.error);
            }
        }

        // Notify Admins if PM updates the project
        if (currentUser.role !== 'ADMIN') {
            this.notifyAllAdmins(
                currentUser.id,
                'PROJECT_UPDATED',
                `Dự án được cập nhật: ${project.name}`,
                `${currentUser.full_name} vừa cập nhật thông tin dự án`,
                { projectId: project.id, projectName: project.name, updatedBy: currentUser.full_name }
            );
        }

        notificationService.broadcastAdminUpdate().catch(console.error);

        return this.getProjectById(project.id, currentUser);
    }

    async updateProjectStatus(id, status, currentUser) {
        if (!PROJECT_STATUSES.includes(status)) {
            throw this.createError('Trạng thái project không hợp lệ.', 400);
        }

        return this.updateProject(id, { status }, currentUser);
    }

    async archiveProject(id, currentUser) {
        const project = await Project.findByPk(id);
        const result = await this.updateProjectStatus(id, 'ARCHIVED', currentUser);
        // Notify all members about archive
        if (project) {
            this.notifyAllProjectMembers(
                id,
                currentUser.id,
                'PROJECT_ARCHIVED',
                `Dự án đã bị đóng: ${project.name}`,
                `${currentUser.full_name} đã đóng dự án này`,
                { projectId: id, projectName: project.name, archivedBy: currentUser.full_name }
            );

            if (currentUser.role !== 'ADMIN') {
                this.notifyAllAdmins(
                    currentUser.id,
                    'PROJECT_ARCHIVED',
                    `Dự án đã bị đóng: ${project.name}`,
                    `${currentUser.full_name} đã đóng dự án này`,
                    { projectId: id, projectName: project.name, archivedBy: currentUser.full_name }
                );
            }
        }
        
        notificationService.broadcastAdminUpdate().catch(console.error);
        
        return result;
    }

    async softDeleteProject(id, currentUser) {
        const project = await Project.findByPk(id);
        if (!project) {
            throw this.createError('Không tìm thấy project.', 404);
        }

        await this.ensureCanManageProject(project, currentUser);

        await project.update({
            is_deleted: true,
            updated_by: currentUser.id
        });

        // Optionally, notify members
        this.notifyAllProjectMembers(
            id,
            currentUser.id,
            'PROJECT_DELETED',
            `Dự án đã bị xóa: ${project.name}`,
            `${currentUser.full_name} đã xóa dự án này`,
            { projectId: id, projectName: project.name, deletedBy: currentUser.full_name }
        );

        if (currentUser.role !== 'ADMIN') {
            this.notifyAllAdmins(
                currentUser.id,
                'PROJECT_DELETED',
                `Dự án đã bị xóa: ${project.name}`,
                `${currentUser.full_name} đã xóa dự án này`,
                { projectId: id, projectName: project.name, deletedBy: currentUser.full_name }
            );
        }

        notificationService.broadcastAdminUpdate().catch(console.error);

        return project;
    }

    async getProjectMembers(projectId, currentUser) {
        const project = await Project.findByPk(projectId);

        if (!project) {
            throw this.createError('Không tìm thấy project.', 404);
        }

        await this.ensureCanViewProject(project.id, project.manager_id, currentUser);

        return ProjectMember.findAll({
            where: {
                project_id: projectId
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: USER_SAFE_ATTRIBUTES,
                    include: [
                        {
                            model: require('../models/Department'),
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            order: [['is_active', 'DESC'], ['id', 'DESC']]
        });
    }

    async addProjectMember(projectId, memberData, currentUser) {
        const project = await Project.findByPk(projectId);

        if (!project) {
            throw this.createError('Không tìm thấy project.', 404);
        }

        await this.ensureCanManageProject(project, currentUser);

        const user = await User.findByPk(memberData.user_id);

        if (!user) {
            throw this.createError('Không tìm thấy user cần thêm vào project.', 404);
        }

        if (user.status === 'DISABLED') {
            throw this.createError('Không thể thêm user đã bị vô hiệu hóa vào project.', 400);
        }

        if (currentUser.role === 'PM' && user.department_id !== currentUser.department_id) {
            throw this.createError('PM chỉ có thể thêm thành viên cùng phòng ban.', 403);
        }

        let role = memberData.role || 'MEMBER';
        if (user.role === 'PM') {
            role = 'LEAD';
        }

        if (!PROJECT_MEMBER_ROLES.includes(role)) {
            throw this.createError('Role thành viên project không hợp lệ.', 400);
        }

        const member = await this.addOrReactivateProjectMember(projectId, {
            user_id: memberData.user_id,
            role,
            added_by: currentUser.id
        });

        // Notify the added user
        notificationService.createNotification(
            memberData.user_id,
            'MEMBER_ADDED',
            `Bạn được thêm vào dự án: ${project.name}`,
            `${currentUser.full_name} đã thêm bạn vào dự án với vai trò ${role}`,
            { projectId, projectName: project.name, addedBy: currentUser.full_name, role }
        ).catch(console.error);

        return ProjectMember.findByPk(member.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: USER_SAFE_ATTRIBUTES
                }
            ]
        });
    }

    async removeProjectMember(projectId, userId, currentUser) {
        const project = await Project.findByPk(projectId);

        if (!project) {
            throw this.createError('Không tìm thấy project.', 404);
        }

        await this.ensureCanManageProject(project, currentUser);

        if (Number(project.manager_id) === Number(userId)) {
            throw this.createError('Không thể xóa manager khỏi project. Hãy chuyển manager trước.', 400);
        }

        const member = await ProjectMember.findOne({
            where: {
                project_id: projectId,
                user_id: userId,
                is_active: true
            }
        });

        if (!member) {
            throw this.createError('Không tìm thấy thành viên active trong project.', 404);
        }

        await member.update({
            is_active: false,
            left_at: new Date()
        });

        // Notify the removed user
        notificationService.createNotification(
            userId,
            'MEMBER_REMOVED',
            `Bạn đã bị xóa khỏi dự án: ${project.name}`,
            `${currentUser.full_name} đã xóa bạn khỏi dự án`,
            { projectId, projectName: project.name, removedBy: currentUser.full_name }
        ).catch(console.error);

        return member;
    }

    async addOrReactivateProjectMember(projectId, { user_id, role, added_by }, allowExistingActive = false) {
        const existingMember = await ProjectMember.findOne({
            where: {
                project_id: projectId,
                user_id
            }
        });

        if (existingMember) {
            if (existingMember.is_active) {
                if (allowExistingActive) {
                    return existingMember;
                }

                throw this.createError('User đã là thành viên active của project.', 400);
            }

            await existingMember.update({
                role,
                is_active: true,
                joined_at: new Date(),
                left_at: null,
                added_by
            });

            return existingMember;
        }

        return ProjectMember.create({
            project_id: projectId,
            user_id,
            role,
            added_by
        });
    }

    pickSafeProjectData(projectData) {
        const allowedFields = [
            'name',
            'description',
            'status',
            'start_date',
            'end_date',
            'manager_id'
        ];
        const safeData = {};

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(projectData, field)) {
                safeData[field] = projectData[field];
            }
        });

        return safeData;
    }

    async ensureCanManageProject(project, currentUser) {
        if (currentUser.role === 'ADMIN') {
            return;
        }

        if (currentUser.role === 'PM') {
            if (Number(project.manager_id) === Number(currentUser.id)) {
                return;
            }

            const membership = await ProjectMember.findOne({
                where: {
                    project_id: project.id,
                    user_id: currentUser.id,
                    is_active: true
                }
            });

            if (membership) {
                return;
            }
        }

        throw this.createError('Bạn không có quyền quản lý project này.', 403);
    }

    async ensureCanViewProject(projectId, managerId, currentUser) {
        if (currentUser.role === 'ADMIN') {
            return;
        }

        if (currentUser.role === 'PM' && Number(managerId) === Number(currentUser.id)) {
            return;
        }

        const membership = await ProjectMember.findOne({
            where: {
                project_id: projectId,
                user_id: currentUser.id,
                is_active: true
            }
        });

        if (membership) {
            return;
        }

        throw this.createError('Bạn không có quyền xem project này.', 403);
    }

    async ensureValidManager(managerId) {
        const manager = await User.findByPk(managerId);

        if (!manager) {
            throw this.createError('Không tìm thấy manager.', 404);
        }

        if (manager.status === 'DISABLED') {
            throw this.createError('Manager đã bị vô hiệu hóa.', 400);
        }

        if (!['ADMIN', 'PM'].includes(manager.role)) {
            throw this.createError('Manager của project phải là ADMIN hoặc PM.', 400);
        }
    }

    ensureDateRange(startDate, endDate) {
        if (startDate && endDate && startDate > endDate) {
            throw this.createError('start_date không được lớn hơn end_date.', 400);
        }
    }

    createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }
}

module.exports = new ProjectService();