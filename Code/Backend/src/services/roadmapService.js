const Roadmap = require('../models/Roadmap');

const createRoadmap = async (projectId, data) => {
    return await Roadmap.create({
        project_id: projectId,
        title: data.title || 'Project Roadmap',
        description: data.description || null,
        status: data.status || 'PLANNED',
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_by: data.created_by || null,
        updated_by: data.updated_by || null
    });
};

const getRoadmapByProject = async (projectId) => {
    return await Roadmap.findOne({ where: { project_id: projectId } });
};

module.exports = {
    createRoadmap,
    getRoadmapByProject
};
