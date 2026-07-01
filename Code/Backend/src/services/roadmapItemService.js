const RoadmapItem = require('../models/RoadmapItem');

const createItem = async (roadmapId, data) => {
    return await RoadmapItem.create({ roadmap_id: roadmapId, ...data });
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
