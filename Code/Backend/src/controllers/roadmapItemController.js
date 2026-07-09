const roadmapItemService = require('../services/roadmapItemService');

const createItem = async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const { title, start_date, end_date, sort_order, status, description } = req.body;

        // Validate required fields
        if (!title || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'title, start_date, end_date are required' });
        }

        // Validate date logic
        if (new Date(end_date) < new Date(start_date)) {
            return res.status(400).json({ success: false, message: 'end_date cannot be before start_date' });
        }

        const item = await roadmapItemService.createItem(roadmapId, {
            title, start_date, end_date, sort_order, status, description
        });
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getItemsByRoadmap = async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const items = await roadmapItemService.getItemsByRoadmap(roadmapId);
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Validate date logic if both dates provided
        if (data.start_date && data.end_date) {
            if (new Date(data.end_date) < new Date(data.start_date)) {
                return res.status(400).json({ success: false, message: 'end_date cannot be before start_date' });
            }
        }

        const item = await roadmapItemService.updateItem(id, data, req.user);
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        if (error.message === 'Item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await roadmapItemService.deleteItem(id);
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        if (error.message === 'Item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createItem,
    getItemsByRoadmap,
    updateItem,
    deleteItem
};
