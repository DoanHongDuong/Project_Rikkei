const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
    idParamsSchema,
    memberParamsSchema,
    getProjectsQuerySchema,
    createProjectSchema,
    updateProjectSchema,
    updateProjectStatusSchema,
    addProjectMemberSchema
} = require('../validators/projectValidator');

const adminOrPm = authorizeRoles('ADMIN', 'PM');

router.get(
    '/',
    verifyToken,
    validate({ query: getProjectsQuerySchema }),
    (req, res) => projectController.getProjects(req, res)
);

router.post(
    '/',
    verifyToken,
    adminOrPm,
    validate({ body: createProjectSchema }),
    (req, res) => projectController.createProject(req, res)
);

router.get(
    '/:id',
    verifyToken,
    validate({ params: idParamsSchema }),
    (req, res) => projectController.getProjectDetail(req, res)
);

router.put(
    '/:id',
    verifyToken,
    adminOrPm,
    validate({ params: idParamsSchema, body: updateProjectSchema }),
    (req, res) => projectController.updateProject(req, res)
);

router.patch(
    '/:id/status',
    verifyToken,
    adminOrPm,
    validate({ params: idParamsSchema, body: updateProjectStatusSchema }),
    (req, res) => projectController.updateProjectStatus(req, res)
);

// Không xóa cứng project: DELETE chỉ chuyển status sang is_deleted.
router.delete(
    '/:id',
    verifyToken,
    adminOrPm,
    validate({ params: idParamsSchema }),
    (req, res) => projectController.deleteProject(req, res)
);

router.get(
    '/:id/members',
    verifyToken,
    validate({ params: idParamsSchema }),
    (req, res) => projectController.getProjectMembers(req, res)
);

router.post(
    '/:id/members',
    verifyToken,
    adminOrPm,
    validate({ params: idParamsSchema, body: addProjectMemberSchema }),
    (req, res) => projectController.addProjectMember(req, res)
);

// Không xóa cứng project member: route này chỉ set is_active=false và left_at.
router.delete(
    '/:id/members/:userId',
    verifyToken,
    adminOrPm,
    validate({ params: memberParamsSchema }),
    (req, res) => projectController.removeProjectMember(req, res)
);

module.exports = router;
