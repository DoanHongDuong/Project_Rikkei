const { Op } = require('sequelize');
const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

const TASK_SAFE_ATTRIBUTES = [
    'id',
    'project_id',
    'roadmap_item_id',
    'parent_task_id',
    'assignee_id',
    'created_by',
    'updated_by',
    'title',
    'description',
    'status',
    'priority',
    'start_date',
    'deadline',
    'completed_at',
    'is_deleted',
    'deleted_at',
    'deleted_by',
    'created_at',
    'updated_at'
];
const USER_SAFE_ATTRIBUTES = ['id', 'full_name', 'email', 'role', 'status', 'department_id'];
const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUS_TRANSITIONS = {
    TODO: ['IN_PROGRESS'],
    IN_PROGRESS: ['DONE'],
    DONE: []
};

class TaskService {
    async getTasks(filters, currentUser) {
        const page = filters.page ? Number(filters.page) : 1;
        const limit = filters.limit ? Number(filters.limit) : 1000;
        const offset = (page - 1) * limit;
        const where = await this.buildTaskWhere(filters, currentUser);

        const { rows, count } = await Task.findAndCountAll({
            where,
            attributes: TASK_SAFE_ATTRIBUTES,
            include: this.getTaskIncludes(),
            order: [['id', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        return {
            tasks: rows,
            pagination: {
                page,
                limit,
                totalItems: count,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async getTaskById(id, currentUser) {
        const task = await this.findTaskOrFail(id);
        await this.ensureCanViewTask(task, currentUser);

        return this.findTaskWithIncludes(id);
    }

    async createTask(taskData, currentUser) {
        if (!['ADMIN', 'PM'].includes(currentUser.role)) {
            throw this.createError('Bạn không có quyền tạo task.', 403);
        }

        const project = await this.findProjectOrFail(taskData.project_id);
        this.ensureProjectIsNotArchived(project);
        await this.ensureCanManageProject(project, currentUser);

        if (taskData.assignee_id) {
            await this.ensureCanAssignUser(project.id, taskData.assignee_id);
        }

        if (taskData.status && taskData.status !== 'TODO') {
            throw this.createError('Task mới phải bắt đầu từ trạng thái TODO.', 400);
        }

        this.ensureDateRange(taskData.start_date, taskData.due_date);
        
        if (taskData.due_date && project.end_date && new Date(taskData.due_date) > new Date(project.end_date)) {
            throw this.createError(`Deadline của công việc không được vượt quá Deadline của dự án (${project.end_date}).`, 400);
        }

        const task = await Task.create({
            project_id: taskData.project_id,
            roadmap_item_id: taskData.roadmap_item_id || null,
            parent_task_id: taskData.parent_task_id || null,
            assignee_id: taskData.assignee_id || null,
            created_by: currentUser.id,
            updated_by: currentUser.id,
            title: taskData.title,
            description: taskData.description || null,
            status: 'TODO',
            priority: taskData.priority || 'MEDIUM',
            start_date: taskData.start_date || null,
            deadline: taskData.due_date
        });

        await this.createHistory(task.id, currentUser.id, 'TASK_CREATED', null, null, null, 'Tạo task');

        return this.findTaskWithIncludes(task.id);
    }

    async updateTask(id, updateData, currentUser) {
        const task = await this.findTaskOrFail(id);
        const project = await this.findProjectOrFail(task.project_id);

        await this.ensureCanManageTask(task, project, currentUser);

        const safeUpdateData = this.pickSafeUpdateData(updateData);

        this.ensureDateRange(
            safeUpdateData.start_date || task.start_date,
            safeUpdateData.deadline || task.deadline
        );

        const checkDeadline = safeUpdateData.deadline || task.deadline;
        if (checkDeadline && project.end_date && new Date(checkDeadline) > new Date(project.end_date)) {
            throw this.createError(`Deadline của công việc không được vượt quá Deadline của dự án (${project.end_date}).`, 400);
        }

        await task.update({
            ...safeUpdateData,
            updated_by: currentUser.id
        });

        await this.createHistory(task.id, currentUser.id, 'TASK_UPDATED', null, null, null, 'Cập nhật task');

        return this.findTaskWithIncludes(task.id);
    }

    async updateTaskStatus(id, nextStatus, currentUser) {
        const task = await this.findTaskOrFail(id);
        const project = await this.findProjectOrFail(task.project_id);

        await this.ensureCanUpdateStatus(task, project, currentUser);

        if (!TASK_STATUSES.includes(nextStatus)) {
            throw this.createError('Trạng thái task không hợp lệ.', 400);
        }

        if (task.status === nextStatus) {
            return this.findTaskWithIncludes(task.id);
        }

        const allowedNextStatuses = STATUS_TRANSITIONS[task.status] || [];

        if (!allowedNextStatuses.includes(nextStatus)) {
            throw this.createError(`Không thể chuyển trạng thái từ ${task.status} sang ${nextStatus}.`, 400);
        }

        const oldStatus = task.status;

        await task.update({
            status: nextStatus,
            completed_at: nextStatus === 'DONE' ? new Date() : null,
            updated_by: currentUser.id
        });

        await this.createHistory(
            task.id,
            currentUser.id,
            'STATUS_CHANGED',
            'status',
            oldStatus,
            nextStatus,
            'Cập nhật trạng thái task'
        );

        return this.findTaskWithIncludes(task.id);
    }

    async assignTask(id, assigneeId, currentUser) {
        const task = await this.findTaskOrFail(id);
        const project = await this.findProjectOrFail(task.project_id);

        await this.ensureCanManageTask(task, project, currentUser);

        if (assigneeId) {
            await this.ensureCanAssignUser(project.id, assigneeId);
        }

        const oldAssigneeId = task.assignee_id;

        await task.update({
            assignee_id: assigneeId || null,
            updated_by: currentUser.id
        });

        await this.createHistory(
            task.id,
            currentUser.id,
            'ASSIGNEE_CHANGED',
            'assignee_id',
            oldAssigneeId ? String(oldAssigneeId) : null,
            assigneeId ? String(assigneeId) : null,
            'Gán người thực hiện task'
        );

        return this.findTaskWithIncludes(task.id);
    }

    async softDeleteTask(id, currentUser) {
        const task = await this.findTaskOrFail(id);
        const project = await this.findProjectOrFail(task.project_id);

        await this.ensureCanManageTask(task, project, currentUser);

        await task.update({
            is_deleted: true,
            deleted_at: new Date(),
            deleted_by: currentUser.id,
            updated_by: currentUser.id
        });

        await this.createHistory(task.id, currentUser.id, 'TASK_DELETED', 'is_deleted', 'false', 'true', 'Soft delete task');

        return this.findTaskWithIncludes(task.id);
    }

    async buildTaskWhere(filters, currentUser) {
        const where = {
            is_deleted: false
        };

        if (filters.search) {
            const keyword = `%${filters.search}%`;
            where[Op.or] = [
                { title: { [Op.like]: keyword } },
                { description: { [Op.like]: keyword } }
            ];
        }

        if (filters.project_id) {
            where.project_id = filters.project_id;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.priority) {
            where.priority = filters.priority;
        }

        if (filters.assignee_id) {
            where.assignee_id = filters.assignee_id;
        }

        if (currentUser.role === 'ADMIN') {
            return where;
        }

        if (currentUser.role === 'PM') {
            const managedProjectIds = await this.getManagedProjectIds(currentUser.id);

            if (where.project_id && !managedProjectIds.map(Number).includes(Number(where.project_id))) {
                where.project_id = { [Op.in]: [] };
                return where;
            }

            where.project_id = where.project_id || { [Op.in]: managedProjectIds };

            return where;
        }

        const memberships = await ProjectMember.findAll({
            where: { user_id: currentUser.id, is_active: true },
            attributes: ['project_id']
        });
        const memberProjectIds = memberships.map(m => m.project_id);

        if (where.project_id && !memberProjectIds.map(Number).includes(Number(where.project_id))) {
            where.project_id = { [Op.in]: [] };
            return where;
        }

        where.project_id = where.project_id || { [Op.in]: memberProjectIds };
        return where;
    }

    getTaskIncludes() {
        return [
            {
                model: Project,
                as: 'project',
                attributes: ['id', 'name', 'status', 'manager_id', 'start_date', 'end_date']
            },
            {
                model: User,
                as: 'assignee',
                attributes: USER_SAFE_ATTRIBUTES,
                required: false
            },
            {
                model: User,
                as: 'creator',
                attributes: USER_SAFE_ATTRIBUTES
            },
            {
                model: User,
                as: 'updater',
                attributes: USER_SAFE_ATTRIBUTES,
                required: false
            }
        ];
    }

    async findTaskOrFail(id) {
        const task = await Task.findOne({
            where: {
                id,
                is_deleted: false
            }
        });

        if (!task) {
            throw this.createError('Không tìm thấy task.', 404);
        }

        return task;
    }

    async findTaskWithIncludes(id) {
        return Task.findByPk(id, {
            attributes: TASK_SAFE_ATTRIBUTES,
            include: [
                ...this.getTaskIncludes(),
                {
                    model: TaskHistory,
                    as: 'history',
                    separate: true,
                    limit: 20,
                    order: [['id', 'DESC']],
                    include: [
                        {
                            model: User,
                            as: 'updatedBy',
                            attributes: USER_SAFE_ATTRIBUTES
                        }
                    ]
                }
            ]
        });
    }

    async findProjectOrFail(projectId) {
        const project = await Project.findByPk(projectId);

        if (!project) {
            throw this.createError('Không tìm thấy project của task.', 404);
        }

        return project;
    }

    ensureProjectIsNotArchived(project) {
        if (project.status === 'ARCHIVED') {
            throw this.createError('Không thể thao tác task trong project đã ARCHIVED.', 400);
        }
    }

    async ensureCanViewTask(task, currentUser) {
        if (currentUser.role === 'ADMIN') {
            return;
        }

        if (currentUser.role === 'PM') {
            const project = await this.findProjectOrFail(task.project_id);
            await this.ensureCanManageProject(project, currentUser);
            return;
        }

        const membership = await ProjectMember.findOne({
            where: {
                project_id: task.project_id,
                user_id: currentUser.id,
                is_active: true
            }
        });

        if (membership) {
            return;
        }

        throw this.createError('Bạn không có quyền xem task này.', 403);
    }

    async ensureCanManageTask(task, project, currentUser) {
        if (currentUser.role === 'ADMIN') {
            return;
        }

        await this.ensureCanManageProject(project, currentUser);
    }

    async ensureCanUpdateStatus(task, project, currentUser) {
        if (currentUser.role === 'ADMIN') {
            return;
        }

        if (currentUser.role === 'PM' && Number(project.manager_id) === Number(currentUser.id)) {
            return;
        }

        if (currentUser.role === 'MEMBER' && Number(task.assignee_id) === Number(currentUser.id)) {
            return;
        }

        throw this.createError('Bạn không có quyền cập nhật trạng thái task này.', 403);
    }

    async ensureCanManageProject(project, currentUser) {
        if (currentUser.role === 'ADMIN') {
            return;
        }

        if (currentUser.role === 'PM' && Number(project.manager_id) === Number(currentUser.id)) {
            return;
        }

        throw this.createError('Bạn không có quyền quản lý task trong project này.', 403);
    }

    async ensureCanAssignUser(projectId, assigneeId) {
        const assignee = await User.findByPk(assigneeId);

        if (!assignee) {
            throw this.createError('Không tìm thấy user được assign.', 404);
        }

        if (assignee.status === 'DISABLED') {
            throw this.createError('Không thể assign task cho user đã bị vô hiệu hóa.', 400);
        }

        const membership = await ProjectMember.findOne({
            where: {
                project_id: projectId,
                user_id: assigneeId,
                is_active: true
            }
        });

        if (!membership) {
            throw this.createError('User được assign phải là thành viên active của project.', 400);
        }
    }

    async getManagedProjectIds(pmId) {
        const projects = await Project.findAll({
            where: {
                manager_id: pmId
            },
            attributes: ['id']
        });

        return projects.map((project) => project.id);
    }

    pickSafeUpdateData(updateData) {
        const safeData = {};
        const allowedFields = ['title', 'description', 'priority', 'start_date'];

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(updateData, field)) {
                safeData[field] = updateData[field];
            }
        });

        if (Object.prototype.hasOwnProperty.call(updateData, 'due_date')) {
            safeData.deadline = updateData.due_date;
        }

        if (safeData.priority && !TASK_PRIORITIES.includes(safeData.priority)) {
            throw this.createError('priority không hợp lệ.', 400);
        }

        return safeData;
    }

    ensureDateRange(startDate, dueDate) {
        if (startDate && dueDate && startDate > dueDate) {
            throw this.createError('start_date không được lớn hơn due_date.', 400);
        }
    }

    async createHistory(taskId, updatedBy, actionType, fieldName, oldValue, newValue, note) {
        await TaskHistory.create({
            task_id: taskId,
            updated_by: updatedBy,
            action_type: actionType,
            field_name: fieldName,
            old_value: oldValue,
            new_value: newValue,
            note
        });
    }

    createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }
}

module.exports = new TaskService();
