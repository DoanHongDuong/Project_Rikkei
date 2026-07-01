const RoadmapItem = require('../models/RoadmapItem');

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
    return await RoadmapItem.findAll({
        where: { roadmap_id: roadmapId },
        order: [['sort_order', 'ASC']]
    });
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
