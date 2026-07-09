const { Op, Sequelize } = require('sequelize');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Department = require('../models/Department');
const TaskHistory = require('../models/TaskHistory');

class ReportService {
    // ─── KPI Overview ────────────────────────────────────────────────────────────

    async getTaskOverview() {
        const today = new Date();

        const totalTasks = await Task.count({ where: { is_deleted: false } });

        const doneTasks = await Task.count({
            where: { is_deleted: false, status: 'DONE' }
        });

        const overdueTasks = await Task.count({
            where: {
                is_deleted: false,
                status: { [Op.notIn]: ['DONE', 'CANCELED'] },
                deadline: { [Op.lt]: today }
            }
        });

        const completionRate = totalTasks > 0
            ? Math.round((doneTasks / totalTasks) * 100)
            : 0;

        return { totalTasks, doneTasks, overdueTasks, completionRate };
    }

    // ─── Task Analytics ──────────────────────────────────────────────────────────

    async getTaskByStatus() {
        const rows = await Task.findAll({
            where: { is_deleted: false },
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        return rows.map(r => ({
            status: r.status,
            count: parseInt(r.count, 10)
        }));
    }

    async getTaskByPriority() {
        const rows = await Task.findAll({
            where: { is_deleted: false },
            attributes: [
                'priority',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['priority'],
            raw: true
        });

        return rows.map(r => ({
            priority: r.priority,
            count: parseInt(r.count, 10)
        }));
    }

    async getTaskByProject() {
        const projects = await Project.findAll({
            where: { is_deleted: false },
            attributes: ['id', 'name'],
            include: [{
                model: Task,
                as: 'tasks',
                where: { is_deleted: false },
                attributes: ['status'],
                required: false
            }]
        });

        const result = projects.map(p => {
            const total = p.tasks.length;
            const done = p.tasks.filter(t => t.status === 'DONE').length;
            return { projectName: p.name, total, done };
        });

        // Top 10 by total tasks
        return result
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }

    // ─── Project Report ──────────────────────────────────────────────────────────

    async getProjectReport() {
        const projects = await Project.findAll({
            where: { is_deleted: false },
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'full_name']
                },
                {
                    model: Task,
                    as: 'tasks',
                    where: { is_deleted: false },
                    attributes: ['status'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return projects.map(p => {
            const totalTasks = p.tasks.length;
            const doneTasks = p.tasks.filter(t => t.status === 'DONE').length;
            const progress = totalTasks > 0
                ? Math.round((doneTasks / totalTasks) * 100)
                : 0;

            return {
                id: p.id,
                name: p.name,
                status: p.status,
                managerName: p.manager ? p.manager.full_name : null,
                totalTasks,
                doneTasks,
                progress,
                endDate: p.end_date || null
            };
        });
    }

    // ─── User Performance ────────────────────────────────────────────────────────

    async getUserPerformance() {
        const today = new Date();

        const users = await User.findAll({
            where: { 
                status: 'ACTIVE',
                role: { [Op.ne]: 'ADMIN' }
            },
            include: [
                {
                    model: Department,
                    attributes: ['name'],
                    required: false
                },
                {
                    model: Task,
                    as: 'assigned_tasks',
                    where: { is_deleted: false },
                    attributes: ['status', 'deadline'],
                    required: false
                }
            ],
            order: [['full_name', 'ASC']]
        });

        return users.map(u => {
            const tasks = u.assigned_tasks || [];
            const totalAssigned = tasks.length;
            const done = tasks.filter(t => t.status === 'DONE').length;
            const overdue = tasks.filter(t =>
                !['DONE', 'CANCELED'].includes(t.status) &&
                t.deadline &&
                new Date(t.deadline) < today
            ).length;
            const completionRate = totalAssigned > 0
                ? Math.round((done / totalAssigned) * 100)
                : 0;

            return {
                id: u.id,
                fullName: u.full_name,
                department: u.Department ? u.Department.name : null,
                totalAssigned,
                done,
                overdue,
                completionRate
            };
        });
    }

    // ─── Department Summary ───────────────────────────────────────────────────────

    async getDepartmentSummary() {
        const today = new Date();

        const departments = await Department.findAll({
            include: [{
                model: User,
                attributes: ['id', 'status'],
                required: false
            }],
            order: [['name', 'ASC']]
        });

        const result = [];

        for (const dept of departments) {
            const activeUsers = (dept.Users || []).filter(u => u.status === 'ACTIVE');
            const userIds = activeUsers.map(u => u.id);

            let activeTasks = 0;
            let doneTasks = 0;
            let totalTasks = 0;

            if (userIds.length > 0) {
                totalTasks = await Task.count({
                    where: {
                        assignee_id: { [Op.in]: userIds },
                        is_deleted: false
                    }
                });

                doneTasks = await Task.count({
                    where: {
                        assignee_id: { [Op.in]: userIds },
                        is_deleted: false,
                        status: 'DONE'
                    }
                });

                activeTasks = await Task.count({
                    where: {
                        assignee_id: { [Op.in]: userIds },
                        is_deleted: false,
                        status: { [Op.in]: ['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED'] }
                    }
                });
            }

            const completionRate = totalTasks > 0
                ? Math.round((doneTasks / totalTasks) * 100)
                : 0;

            result.push({
                id: dept.id,
                name: dept.name,
                userCount: activeUsers.length,
                activeTasks,
                completionRate
            });
        }

        return result;
    }

    // ─── Activity Timeline ───────────────────────────────────────────────────────

    async getActivityTimeline() {
        const history = await TaskHistory.findAll({
            limit: 20,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'updatedBy',
                    attributes: ['id', 'full_name', 'role']
                },
                {
                    model: Task.unscoped(),
                    as: 'task',
                    attributes: ['id', 'title'],
                    include: [
                        {
                            model: Project.unscoped(),
                            as: 'project',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        // Collect all assignee IDs to fetch their names
        const assigneeIds = new Set();
        history.forEach(h => {
            if (h.action_type === 'ASSIGNEE_CHANGED') {
                if (h.new_value && /^\d+$/.test(String(h.new_value))) assigneeIds.add(Number(h.new_value));
                if (h.old_value && /^\d+$/.test(String(h.old_value))) assigneeIds.add(Number(h.old_value));
            }
        });

        // Fetch users and create a map
        const userMap = new Map();
        if (assigneeIds.size > 0) {
            const users = await User.findAll({
                where: { id: Array.from(assigneeIds) },
                attributes: ['id', 'full_name']
            });
            users.forEach(u => userMap.set(u.id, u.full_name));
        }

        return history.map(h => {
            let newValue = h.new_value;
            let oldValue = h.old_value;

            if (h.action_type === 'ASSIGNEE_CHANGED') {
                if (h.new_value && /^\d+$/.test(String(h.new_value))) newValue = userMap.get(Number(h.new_value)) || h.new_value;
                if (h.old_value && /^\d+$/.test(String(h.old_value))) oldValue = userMap.get(Number(h.old_value)) || h.old_value;
            }

            return {
                id: h.id,
                action_type: h.action_type,
                field_name: h.field_name,
                old_value: oldValue,
                new_value: newValue,
                created_at: h.created_at,
                updatedBy: h.updatedBy ? { id: h.updatedBy.id, full_name: h.updatedBy.full_name, role: h.updatedBy.role } : null,
                task: h.task ? { 
                    id: h.task.id, 
                    title: h.task.title,
                    project: h.task.project ? { id: h.task.project.id, name: h.task.project.name } : null
                } : null
            };
        });
    }

    // ─── Project Status Distribution ─────────────────────────────────────────────

    async getProjectStatusDistribution() {
        const statuses = await Project.findAll({
            where: { is_deleted: false },
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        return statuses.map(item => ({
            status: item.status,
            count: parseInt(item.count, 10)
        }));
    }

    // ─── Task Trend (Last 7 Days) ────────────────────────────────────────────────

    async getTaskTrend() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const tasks = await Task.findAll({
            where: {
                is_deleted: false,
                [Op.or]: [
                    { created_at: { [Op.gte]: sevenDaysAgo } },
                    { completed_at: { [Op.gte]: sevenDaysAgo } }
                ]
            },
            attributes: ['id', 'created_at', 'completed_at']
        });

        const trendMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            trendMap[dateStr] = { date: dateStr, created: 0, completed: 0 };
        }

        tasks.forEach(t => {
            if (t.created_at) {
                const createdDate = new Date(t.created_at).toISOString().split('T')[0];
                if (trendMap[createdDate]) {
                    trendMap[createdDate].created += 1;
                }
            }
            if (t.completed_at) {
                const completedDate = new Date(t.completed_at).toISOString().split('T')[0];
                if (trendMap[completedDate]) {
                    trendMap[completedDate].completed += 1;
                }
            }
        });

        return Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
    }

    // ─── Aggregator ──────────────────────────────────────────────────────────────

    async getAdminReport() {
        try {
            const [
                taskOverview,
                taskByStatus,
                taskByPriority,
                taskByProject,
                projectReport,
                userPerformance,
                departmentSummary,
                activityTimeline,
                projectStatusDistribution,
                taskTrend
            ] = await Promise.all([
                this.getTaskOverview(),
                this.getTaskByStatus(),
                this.getTaskByPriority(),
                this.getTaskByProject(),
                this.getProjectReport(),
                this.getUserPerformance(),
                this.getDepartmentSummary(),
                this.getActivityTimeline(),
                this.getProjectStatusDistribution(),
                this.getTaskTrend()
            ]);

            return {
                taskOverview,
                taskByStatus,
                taskByPriority,
                taskByProject,
                projectReport,
                userPerformance,
                departmentSummary,
                activityTimeline,
                projectStatusDistribution,
                taskTrend
            };
        } catch (error) {
            console.error('ReportService.getAdminReport error:', error);
            throw new Error('Lỗi khi tổng hợp dữ liệu báo cáo');
        }
    }
}

module.exports = new ReportService();
