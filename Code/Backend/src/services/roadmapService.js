const Roadmap = require('../models/Roadmap');

const createRoadmap = async (projectId, data) => {
    return await Roadmap.create({ project_id: projectId, ...data });
};

const getRoadmapByProject = async (projectId) => {
    return await Roadmap.findOne({ where: { project_id: projectId } });
};

module.exports = {
    createRoadmap,
    getRoadmapByProject
};
