const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
    idParamsSchema,
    getTasksQuerySchema,
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    assignTaskSchema
} = require('../validators/taskValidator');

const adminOrPm = authorizeRoles('ADMIN', 'PM');

router.get(
    '/',
    verifyToken,
    validate({ query: getTasksQuerySchema }),
    (req, res) => taskController.getTasks(req, res)
);

router.get(
    '/:id',
    verifyToken,
    validate({ params: idParamsSchema }),
    (req, res) => taskController.getTaskDetail(req, res)
);

router.post(
    '/',
    verifyToken,
    adminOrPm,
    validate({ body: createTaskSchema }),
    (req, res) => taskController.createTask(req, res)
);

router.put(
    '/:id',
    verifyToken,
    adminOrPm,
    validate({ params: idParamsSchema, body: updateTaskSchema }),
    (req, res) => taskController.updateTask(req, res)
);

router.patch(
    '/:id/status',
    verifyToken,
    validate({ params: idParamsSchema, body: updateTaskStatusSchema }),
    (req, res) => taskController.updateTaskStatus(req, res)
);

router.patch(
    '/:id/assign',
    verifyToken,
    adminOrPm,
    validate({ params: idParamsSchema, body: assignTaskSchema }),
    (req, res) => taskController.assignTask(req, res)
);

// Không xóa cứng task: route này chỉ set is_deleted=true.
router.delete(
    '/:id',
    verifyToken,
    adminOrPm,
    validate({ params: idParamsSchema }),
    (req, res) => taskController.deleteTask(req, res)
);

module.exports = router;
