const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { Sequelize } = require('sequelize');

class DashboardService {
    async getAdminMetrics() {
        try {
            // Count total users (excluding deleted if there was a deleted column, but status is ACTIVE/DISABLED)
            // Active users
            const totalUsers = await User.count({ where: { status: 'ACTIVE' } });
            
            // Total projects
            const totalProjects = await Project.count();
            
            // Total tasks
            const totalTasks = await Task.count({ where: { is_deleted: false } });
            
            // Active projects
            const activeProjects = await Project.count({ where: { status: 'ACTIVE' } });

            // Project Status Distribution
            const projectStatusDistribution = await Project.findAll({
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['status']
            });

            // Task Status Distribution
            const taskStatusDistribution = await Task.findAll({
                where: { is_deleted: false },
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['status']
            });

            return {
                totalUsers,
                totalProjects,
                totalTasks,
                activeProjects,
                projectStatusDistribution: projectStatusDistribution.map(item => ({
                    status: item.status,
                    count: parseInt(item.get('count'), 10)
                })),
                taskStatusDistribution: taskStatusDistribution.map(item => ({
                    status: item.status,
                    count: parseInt(item.get('count'), 10)
                }))
            };
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            throw new Error('Lỗi khi lấy dữ liệu dashboard admin');
        }
    }

    async getMemberMetrics(userId) {
        try {
            const ProjectMember = require('../models/ProjectMember');
            const { Op } = require('sequelize');
            
            // Lấy danh sách ID các project mà user đang tham gia
            const projectMemberships = await ProjectMember.findAll({
                where: { user_id: userId, is_active: true },
                include: [{
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'status', 'start_date', 'end_date']
                }]
            });

            const totalProjects = projectMemberships.length;

            const activeProjects = projectMemberships.map(pm => {
                const project = pm.project;
                return {
                    id: project.id,
                    name: project.name,
                    role: pm.role,
                    status: project.status,
                    progress: 0
                };
            });

            // Nếu muốn tiến độ thực: duyệt qua từng project và đếm task DONE / tổng task
            for (let p of activeProjects) {
                const totalTasksInProj = await Task.count({ where: { project_id: p.id, is_deleted: false } });
                const doneTasksInProj = await Task.count({ where: { project_id: p.id, status: 'DONE', is_deleted: false } });
                p.progress = totalTasksInProj > 0 ? Math.round((doneTasksInProj / totalTasksInProj) * 100) : 0;
            }

            // Đếm task được giao cho user
            const totalTasks = await Task.count({ where: { assignee_id: userId, is_deleted: false } });
            
            // Số task hoàn thành
            const completedTasks = await Task.count({ where: { assignee_id: userId, status: 'DONE', is_deleted: false } });
            
            // Số task quá hạn (deadline < now, status != DONE)
            const today = new Date();
            const overdueTasks = await Task.count({ 
                where: { 
                    assignee_id: userId, 
                    is_deleted: false,
                    status: { [Op.ne]: 'DONE' },
                    deadline: { [Op.lt]: today }
                } 
            });

            // Phân bổ trạng thái task
            const taskStatusDistribution = await Task.findAll({
                where: { assignee_id: userId, is_deleted: false },
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['status']
            });

            // Phân bổ độ ưu tiên task
            const taskPriorityDistribution = await Task.findAll({
                where: { assignee_id: userId, is_deleted: false },
                attributes: ['priority', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['priority']
            });

            return {
                totalProjects,
                totalTasks,
                completedTasks,
                overdueTasks,
                taskStatusDistribution: taskStatusDistribution.map(item => ({
                    status: item.status,
                    count: parseInt(item.get('count'), 10)
                })),
                taskPriorityDistribution: taskPriorityDistribution.map(item => ({
                    priority: item.priority,
                    count: parseInt(item.get('count'), 10)
                })),
                activeProjects
            };
        } catch (error) {
            console.error('Error fetching member metrics:', error);
            throw new Error('Lỗi khi lấy dữ liệu dashboard thành viên');
        }
    }

    async getPmMetrics(userId) {
        try {
            const ProjectMember = require('../models/ProjectMember');
            const { Op } = require('sequelize');

            // Find projects where user is LEAD (PM) or just a member if PM role implicitly gives LEAD access to their projects
            // Usually PM creates projects and is assigned as LEAD, or they are just the 'manager_id' in some schemas.
            // Let's assume PM manages projects where they are in ProjectMember with role 'LEAD'.
            // Actually, in our schema, PM role might just see projects they are assigned to, or all projects if they created them. Let's get projects where they are LEAD or they created (manager_id if exists).
            // Let's check how ProjectService gets projects for PM. Usually it queries all projects where user is in ProjectMembers.
            const projectMemberships = await ProjectMember.findAll({
                where: { user_id: userId, is_active: true },
                include: [{
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'status', 'start_date', 'end_date']
                }]
            });

            // If a user with PM role is just retrieving their projects, we just use their memberships
            let managedProjects = projectMemberships.map(pm => pm.project);

            // De-duplicate projects if necessary
            const uniqueProjects = [];
            const projectIds = new Set();
            for (let p of managedProjects) {
                if (!projectIds.has(p.id)) {
                    projectIds.add(p.id);
                    uniqueProjects.push(p);
                }
            }

            const totalProjects = uniqueProjects.length;
            const activeProjects = uniqueProjects.filter(p => p.status === 'ACTIVE').length;
            const completedProjects = uniqueProjects.filter(p => p.status === 'COMPLETED').length;
            
            const today = new Date();
            let atRiskProjectsCount = 0;

            const projectDetails = [];
            const projectStatusDistributionMap = { ACTIVE: 0, COMPLETED: 0, ON_HOLD: 0 };

            for (let p of uniqueProjects) {
                if (projectStatusDistributionMap[p.status] !== undefined) {
                    projectStatusDistributionMap[p.status]++;
                } else {
                    projectStatusDistributionMap[p.status] = 1;
                }

                // Check if at risk (ACTIVE and deadline < 7 days from now or overdue)
                let isAtRisk = false;
                if (p.status === 'ACTIVE' && p.end_date) {
                    const endDate = new Date(p.end_date);
                    const diffTime = endDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 7) {
                        isAtRisk = true;
                        atRiskProjectsCount++;
                    }
                }

                // Get tasks for this project
                const totalTasksInProj = await Task.count({ where: { project_id: p.id, is_deleted: false } });
                const doneTasksInProj = await Task.count({ where: { project_id: p.id, status: 'DONE', is_deleted: false } });
                
                projectDetails.push({
                    id: p.id,
                    name: p.name,
                    status: p.status,
                    end_date: p.end_date,
                    isAtRisk: isAtRisk,
                    totalTasks: totalTasksInProj,
                    completedTasks: doneTasksInProj,
                    progress: totalTasksInProj > 0 ? Math.round((doneTasksInProj / totalTasksInProj) * 100) : 0
                });
            }

            const projectStatusDistribution = Object.keys(projectStatusDistributionMap).map(key => ({
                status: key,
                count: projectStatusDistributionMap[key]
            }));

            // Top 5 projects by recent end_date or just take first 5 for the bar chart
            const topProjects = [...projectDetails].sort((a, b) => b.totalTasks - a.totalTasks).slice(0, 5);

            return {
                totalProjects,
                activeProjects,
                completedProjects,
                atRiskProjects: atRiskProjectsCount,
                projectStatusDistribution,
                topProjectsProgress: topProjects.map(p => ({
                    name: p.name,
                    total: p.totalTasks,
                    completed: p.completedTasks
                })),
                recentProjects: projectDetails // send all, frontend will render in table
            };

        } catch (error) {
            console.error('Error fetching PM metrics:', error);
            throw new Error('Lỗi khi lấy dữ liệu dashboard PM');
        }
    }
}

module.exports = new DashboardService();
