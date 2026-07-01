const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const roadmapItemController = require('../controllers/roadmapItemController');
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Authentication middleware for all roadmap routes
router.use(verifyToken);

// Roadmap endpoints
router.post('/projects/:projectId/roadmaps', roleMiddleware("ADMIN", "PM"), roadmapController.createRoadmap);
router.get('/projects/:projectId/roadmaps', roadmapController.getRoadmapByProject);

// RoadmapItem endpoints
router.get('/roadmaps/:roadmapId/items', roadmapItemController.getItemsByRoadmap);
router.post('/roadmaps/:roadmapId/items', roleMiddleware("ADMIN", "PM"), roadmapItemController.createItem);
router.put('/roadmap-items/:id', roleMiddleware("ADMIN", "PM"), roadmapItemController.updateItem);
router.delete('/roadmap-items/:id', roleMiddleware("ADMIN", "PM"), roadmapItemController.deleteItem);

module.exports = router;
