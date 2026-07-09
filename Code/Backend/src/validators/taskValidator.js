const Joi = require('joi');

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const idParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Task id phải là số.',
        'number.integer': 'Task id phải là số nguyên.',
        'number.positive': 'Task id phải lớn hơn 0.',
        'any.required': 'Task id là bắt buộc.'
    })
});

const getTasksQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(DEFAULT_PAGE),
    limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    search: Joi.string().trim().allow('').max(100).default(''),
    project_id: Joi.number().integer().positive().optional(),
    assignee_id: Joi.number().integer().positive().optional(),
    status: Joi.string().valid(...TASK_STATUSES).optional(),
    priority: Joi.string().valid(...TASK_PRIORITIES).optional()
});

const createTaskSchema = Joi.object({
    project_id: Joi.number().integer().positive().required().messages({
        'any.required': 'project_id là bắt buộc.',
        'number.base': 'project_id phải là số.',
        'number.integer': 'project_id phải là số nguyên.',
        'number.positive': 'project_id phải lớn hơn 0.'
    }),
    assignee_id: Joi.number().integer().positive().allow(null).optional(),
    parent_task_id: Joi.number().integer().positive().allow(null).optional(),
    roadmap_item_id: Joi.number().integer().positive().allow(null).optional(),
    title: Joi.string().trim().min(2).max(255).required().messages({
        'string.min': 'title phải có ít nhất 2 ký tự.',
        'string.max': 'title không được vượt quá 255 ký tự.',
        'any.required': 'title là bắt buộc.',
        'string.empty': 'title là bắt buộc.'
    }),
    description: Joi.string().trim().allow('', null).optional(),
    priority: Joi.string().valid(...TASK_PRIORITIES).default('MEDIUM').messages({
        'any.only': 'priority phải là LOW, MEDIUM, HIGH hoặc URGENT.'
    }),
    status: Joi.string().valid(...TASK_STATUSES).default('TODO').messages({
        'any.only': 'status phải là TODO, IN_PROGRESS hoặc DONE.'
    }),
    start_date: Joi.string().pattern(DATE_PATTERN).allow(null).optional().messages({
        'string.pattern.base': 'start_date phải có định dạng YYYY-MM-DD.'
    }),
    due_date: Joi.string().pattern(DATE_PATTERN).required().messages({
        'string.pattern.base': 'due_date phải có định dạng YYYY-MM-DD.',
        'any.required': 'due_date là bắt buộc.'
    })
}).custom((value, helpers) => {
    if (value.start_date && value.due_date && value.start_date > value.due_date) {
        return helpers.error('any.invalid', {
            message: 'start_date không được lớn hơn due_date.'
        });
    }

    return value;
}).messages({
    'any.invalid': '{{#message}}'
});

const updateTaskSchema = Joi.object({
    title: Joi.string().trim().min(2).max(255).optional(),
    description: Joi.string().trim().allow('', null).optional(),
    priority: Joi.string().valid(...TASK_PRIORITIES).optional().messages({
        'any.only': 'priority phải là LOW, MEDIUM, HIGH hoặc URGENT.'
    }),
    start_date: Joi.string().pattern(DATE_PATTERN).allow(null).optional().messages({
        'string.pattern.base': 'start_date phải có định dạng YYYY-MM-DD.'
    }),
    due_date: Joi.string().pattern(DATE_PATTERN).optional().messages({
        'string.pattern.base': 'due_date phải có định dạng YYYY-MM-DD.'
    })
}).min(1).custom((value, helpers) => {
    if (value.start_date && value.due_date && value.start_date > value.due_date) {
        return helpers.error('any.invalid', {
            message: 'start_date không được lớn hơn due_date.'
        });
    }

    return value;
}).messages({
    'object.min': 'Cần cung cấp ít nhất một trường để cập nhật.',
    'any.invalid': '{{#message}}'
});

const updateTaskStatusSchema = Joi.object({
    status: Joi.string().valid(...TASK_STATUSES).required().messages({
        'any.only': 'status phải là TODO, IN_PROGRESS hoặc DONE.',
        'any.required': 'status là bắt buộc.',
        'string.empty': 'status là bắt buộc.'
    })
});

const assignTaskSchema = Joi.object({
    assignee_id: Joi.number().integer().positive().allow(null).required().messages({
        'number.base': 'assignee_id phải là số.',
        'number.integer': 'assignee_id phải là số nguyên.',
        'number.positive': 'assignee_id phải lớn hơn 0.',
        'any.required': 'assignee_id là bắt buộc.'
    })
});

module.exports = {
    idParamsSchema,
    getTasksQuerySchema,
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    assignTaskSchema
};
