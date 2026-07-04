const RoadmapItem = require('../models/RoadmapItem');
const Task = require('../models/Task');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const notificationService = require('./notificationService');

const TASK_ATTRIBUTES = ['id', 'title', 'status', 'priority', 'deadline', 'assignee_id'];

// Task hợp lệ để tính progress: bỏ task đã xóa mềm và task CANCELED
// (đồng bộ với cách tính progress ở cấp Project trong projectService.js)
const calculateItemProgress = (tasks) => {
    const validTasks = (tasks || []).filter((task) => task.status !== 'CANCELED');

    if (!validTasks.length) {
        return 0;
    }

    const doneCount = validTasks.filter((task) => task.status === 'DONE').length;

    return Math.round((doneCount / validTasks.length) * 100);
};

const ensureDateRange = (startDate, endDate, projectStartDate, projectEndDate) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        const error = new Error('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
        error.statusCode = 400;
        throw error;
    }
    if (startDate && projectStartDate && new Date(startDate) < new Date(projectStartDate)) {
        const error = new Error(`Ngày bắt đầu không được sớm hơn ngày bắt đầu dự án (${projectStartDate}).`);
        error.statusCode = 400;
        throw error;
    }
    if (endDate && projectEndDate && new Date(endDate) > new Date(projectEndDate)) {
        const error = new Error(`Ngày kết thúc không được vượt quá ngày kết thúc dự án (${projectEndDate}).`);
        error.statusCode = 400;
        throw error;
    }
};

const getProjectByRoadmapId = async (roadmapId) => {
    const roadmap = await Roadmap.findByPk(roadmapId, {
        include: [{ model: Project, as: 'project' }]
    });
    if (!roadmap || !roadmap.project) {
        throw new Error('Không tìm thấy dự án tương ứng với Roadmap.');
    }
    return roadmap.project;
};

const createItem = async (roadmapId, data) => {
    const project = await getProjectByRoadmapId(roadmapId);
    ensureDateRange(data.start_date, data.end_date, project.start_date, project.end_date);
    return await RoadmapItem.create({
        roadmap_id: roadmapId,
        title: data.title,
        description: data.description || null,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status || 'TODO',
        sort_order: data.sort_order || 0,
        created_by: data.created_by || null,
        updated_by: data.updated_by || null
    });
};

const getItemsByRoadmap = async (roadmapId) => {
    const items = await RoadmapItem.findAll({
        where: { roadmap_id: roadmapId },
        order: [['sort_order', 'ASC']],
        include: [
            {
                model: Task,
                as: 'tasks',
                attributes: TASK_ATTRIBUTES,
                where: { is_deleted: false },
                required: false,
                separate: true,
                order: [['id', 'ASC']],
                include: [
                    { model: User, as: 'assignee', attributes: ['id', 'full_name'] }
                ]
            }
        ]
    });

    items.forEach((item) => {
        item.setDataValue('progress', calculateItemProgress(item.tasks));
    });

    return items;
};

const updateItem = async (itemId, data, currentUser) => {
    const item = await RoadmapItem.findByPk(itemId);
    if (!item) throw new Error('Item not found');
    
    const project = await getProjectByRoadmapId(item.roadmap_id);
    
    ensureDateRange(
        data.start_date || item.start_date, 
        data.end_date || item.end_date,
        project.start_date,
        project.end_date
    );
    
    const updated = await item.update(data);

    // Notify all active project members about roadmap item update
    try {
        const members = await ProjectMember.findAll({
            where: { project_id: project.id, is_active: true },
            attributes: ['user_id']
        });
        const actorId = currentUser ? currentUser.id : null;
        for (const m of members) {
            if (actorId && Number(m.user_id) === Number(actorId)) continue;
            notificationService.createNotification(
                m.user_id,
                'ROADMAP_ITEM_UPDATED',
                `Roadmap cập nhật trong dự án: ${project.name}`,
                `Giai đoạn "${item.title}" vừa được cập nhật`,
                {
                    projectId: project.id,
                    projectName: project.name,
                    roadmapItemTitle: item.title,
                    changedBy: currentUser ? currentUser.full_name : 'Hệ thống'
                }
            ).catch(console.error);
        }
    } catch (err) {
        console.error('roadmapItemService notify error:', err);
    }

    return updated;
};

const deleteItem = async (itemId) => {
    const item = await RoadmapItem.findByPk(itemId);
    if (!item) throw new Error('Item not found');
    return await item.destroy();
};

module.exports = {
    createItem,
    getItemsByRoadmap,
    updateItem,
    deleteItem
};