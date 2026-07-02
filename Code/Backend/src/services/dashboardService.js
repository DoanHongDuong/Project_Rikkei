const { Op } = require('sequelize');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

class DashboardService {
    async getDashboardStatistics(userId, userRole) {
        // Build where conditions based on user role
        const projectWhere = this.buildProjectWhere(userId, userRole);
        const taskWhere = this.buildTaskWhere(userId, userRole);

        // Get total projects
        const totalProjects = await Project.count({
            where: projectWhere
        });

        // Get total tasks
        const totalTasks = await Task.count({
            where: taskWhere
        });

        // Get completed tasks
        const completedTasks = await Task.count({
            where: {
                ...taskWhere,
                status: 'DONE'
            }
        });

        // Get late tasks (deadline < today and status not DONE/CANCELED)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lateTasks = await Task.count({
            where: {
                ...taskWhere,
                deadline: {
                    [Op.lt]: today
                },
                status: {
                    [Op.notIn]: ['DONE', 'CANCELED']
                }
            }
        });

        // Get in-progress tasks
        const inProgressTasks = await Task.count({
            where: {
                ...taskWhere,
                status: 'IN_PROGRESS'
            }
        });

        // Get todo tasks
        const todoTasks = await Task.count({
            where: {
                ...taskWhere,
                status: 'TODO'
            }
        });

        // Get blocked tasks
        const blockedTasks = await Task.count({
            where: {
                ...taskWhere,
                status: 'BLOCKED'
            }
        });

        // Get review tasks
        const reviewTasks = await Task.count({
            where: {
                ...taskWhere,
                status: 'REVIEW'
            }
        });

        return {
            totalProjects,
            totalTasks,
            completedTasks,
            lateTasks,
            inProgressTasks,
            todoTasks,
            blockedTasks,
            reviewTasks
        };
    }

    buildProjectWhere(userId, userRole) {
        const where = {
            status: { [Op.ne]: 'ARCHIVED' }
        };

        // If not admin, only show projects user is involved in
        if (userRole !== 'ADMIN') {
            where[Op.or] = [
                { manager_id: userId },
                { created_by: userId }
            ];
        }

        return where;
    }

    buildTaskWhere(userId, userRole) {
        const where = {
            is_deleted: false
        };

        // If not admin, only show tasks assigned to user or created by user
        if (userRole !== 'ADMIN') {
            where[Op.or] = [
                { assignee_id: userId },
                { created_by: userId }
            ];
        }

        return where;
    }

    async getRecentActivities(userId, userRole, limit = 10) {
        // Get recent tasks assigned to user
        const taskWhere = this.buildTaskWhere(userId, userRole);
        
        const recentTasks = await Task.findAll({
            where: taskWhere,
            order: [['updated_at', 'DESC']],
            limit,
            include: [
                {
                    model: Project,
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'assignee',
                    attributes: ['id', 'full_name']
                }
            ]
        });

        return recentTasks.map(task => ({
            id: task.id,
            title: task.title,
            status: task.status,
            project: task.Project ? task.Project.name : 'N/A',
            assignee: task.assignee ? task.assignee.full_name : 'N/A',
            updated_at: task.updated_at
        }));
    }
}

module.exports = new DashboardService();
