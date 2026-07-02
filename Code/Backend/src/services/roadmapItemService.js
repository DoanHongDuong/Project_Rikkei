const RoadmapItem = require('../models/RoadmapItem');
const Task = require('../models/Task');
const User = require('../models/User');

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

const createItem = async (roadmapId, data) => {
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

const updateItem = async (itemId, data) => {
    const item = await RoadmapItem.findByPk(itemId);
    if (!item) throw new Error('Item not found');
    return await item.update(data);
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