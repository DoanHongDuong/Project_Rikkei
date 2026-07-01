const roadmapService = require('../services/roadmapService');

const createRoadmap = async (req, res) => {
    try {
        const { projectId } = req.params;
        const data = req.body;
        const roadmap = await roadmapService.createRoadmap(projectId, data);
        res.status(201).json({ success: true, data: roadmap });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRoadmapByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const roadmap = await roadmapService.getRoadmapByProject(projectId);
        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }
        res.status(200).json({ success: true, data: roadmap });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createRoadmap,
    getRoadmapByProject
};
