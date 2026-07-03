const commentService = require('../services/commentService');

exports.getCommentsByTask = async (req, res) => {
    try {
        const comments = await commentService.getByTask(req.params.taskId, req.user);
        res.json({ success: true, data: comments });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { content, parent_comment_id } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
        }
        const comment = await commentService.create(req.params.taskId, req.user, content, parent_comment_id);
        res.status(201).json({ success: true, data: comment, message: 'Thêm bình luận thành công' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        await commentService.softDelete(req.params.id, req.user);
        res.json({ success: true, message: 'Xóa bình luận thành công' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
