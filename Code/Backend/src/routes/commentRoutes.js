const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/tasks/:taskId/comments', commentController.getCommentsByTask);
router.post('/tasks/:taskId/comments', commentController.createComment);
router.delete('/comments/:id', commentController.deleteComment);

module.exports = router;
