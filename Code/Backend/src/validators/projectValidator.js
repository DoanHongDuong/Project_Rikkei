const Joi = require('joi');

const PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
const PROJECT_MEMBER_ROLES = ['MEMBER', 'LEAD', 'REVIEWER'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const idParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Project id phải là số.',
        'number.integer': 'Project id phải là số nguyên.',
        'number.positive': 'Project id phải lớn hơn 0.',
        'any.required': 'Project id là bắt buộc.'
    })
});

const memberParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Project id phải là số.',
        'number.integer': 'Project id phải là số nguyên.',
        'number.positive': 'Project id phải lớn hơn 0.',
        'any.required': 'Project id là bắt buộc.'
    }),
    userId: Joi.number().integer().positive().required().messages({
        'number.base': 'User id phải là số.',
        'number.integer': 'User id phải là số nguyên.',
        'number.positive': 'User id phải lớn hơn 0.',
        'any.required': 'User id là bắt buộc.'
    })
});

const getProjectsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(DEFAULT_PAGE),
    limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    search: Joi.string().trim().allow('').max(100).default(''),
    status: Joi.string().valid(...PROJECT_STATUSES).optional(),
    manager_id: Joi.number().integer().positive().optional()
});

const createProjectSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required().messages({
        'string.min': 'Tên project phải có ít nhất 2 ký tự.',
        'string.max': 'Tên project không được vượt quá 200 ký tự.',
        'any.required': 'Tên project là bắt buộc.',
        'string.empty': 'Tên project là bắt buộc.'
    }),
    description: Joi.string().trim().allow('', null).optional(),
    status: Joi.string().valid(...PROJECT_STATUSES).default('ACTIVE'),
    start_date: Joi.string().pattern(DATE_PATTERN).required().messages({
        'string.pattern.base': 'start_date phải có định dạng YYYY-MM-DD.',
        'any.required': 'start_date là bắt buộc.'
    }),
    end_date: Joi.string().pattern(DATE_PATTERN).required().messages({
        'string.pattern.base': 'end_date phải có định dạng YYYY-MM-DD.',
        'any.required': 'end_date là bắt buộc.'
    }),
    manager_id: Joi.number().integer().positive().allow(null).optional()
}).custom((value, helpers) => {
    if (value.start_date > value.end_date) {
        return helpers.error('any.invalid', {
            message: 'start_date không được lớn hơn end_date.'
        });
    }

    return value;
}).messages({
    'any.invalid': '{{#message}}'
});

const updateProjectSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().allow('', null).optional(),
    status: Joi.string().valid(...PROJECT_STATUSES).optional(),
    start_date: Joi.string().pattern(DATE_PATTERN).optional().messages({
        'string.pattern.base': 'start_date phải có định dạng YYYY-MM-DD.'
    }),
    end_date: Joi.string().pattern(DATE_PATTERN).optional().messages({
        'string.pattern.base': 'end_date phải có định dạng YYYY-MM-DD.'
    }),
    manager_id: Joi.number().integer().positive().allow(null).optional()
}).min(1).custom((value, helpers) => {
    if (value.start_date && value.end_date && value.start_date > value.end_date) {
        return helpers.error('any.invalid', {
            message: 'start_date không được lớn hơn end_date.'
        });
    }

    return value;
}).messages({
    'object.min': 'Cần cung cấp ít nhất một trường để cập nhật.',
    'any.invalid': '{{#message}}'
});

const updateProjectStatusSchema = Joi.object({
    status: Joi.string().valid(...PROJECT_STATUSES).required().messages({
        'any.only': 'status phải là ACTIVE, ON_HOLD, COMPLETED hoặc ARCHIVED.',
        'any.required': 'status là bắt buộc.',
        'string.empty': 'status là bắt buộc.'
    })
});

const addProjectMemberSchema = Joi.object({
    user_id: Joi.number().integer().positive().required().messages({
        'number.base': 'user_id phải là số.',
        'number.integer': 'user_id phải là số nguyên.',
        'number.positive': 'user_id phải lớn hơn 0.',
        'any.required': 'user_id là bắt buộc.'
    }),
    role: Joi.string().valid(...PROJECT_MEMBER_ROLES).default('MEMBER').messages({
        'any.only': 'role phải là MEMBER, LEAD hoặc REVIEWER.'
    })
});

module.exports = {
    idParamsSchema,
    memberParamsSchema,
    getProjectsQuerySchema,
    createProjectSchema,
    updateProjectSchema,
    updateProjectStatusSchema,
    addProjectMemberSchema
};
