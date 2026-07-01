const Joi = require('joi');

const USER_ROLES = ['ADMIN', 'PM', 'MEMBER'];
const USER_STATUSES = ['ACTIVE', 'DISABLED'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const getUsersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(DEFAULT_PAGE).messages({
        'number.base': 'page phải là số.',
        'number.integer': 'page phải là số nguyên.',
        'number.min': 'page phải lớn hơn hoặc bằng 1.'
    }),
    limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).messages({
        'number.base': 'limit phải là số.',
        'number.integer': 'limit phải là số nguyên.',
        'number.min': 'limit phải lớn hơn hoặc bằng 1.',
        'number.max': `limit không được vượt quá ${MAX_LIMIT}.`
    }),
    search: Joi.string().trim().allow('').max(100).default('').messages({
        'string.max': 'search không được vượt quá 100 ký tự.'
    }),
    role: Joi.string().valid(...USER_ROLES).optional().messages({
        'any.only': 'role phải là ADMIN, PM hoặc MEMBER.'
    }),
    status: Joi.string().valid(...USER_STATUSES).optional().messages({
        'any.only': 'status phải là ACTIVE hoặc DISABLED.'
    }),
    department_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'department_id phải là số.',
        'number.integer': 'department_id phải là số nguyên.',
        'number.positive': 'department_id phải lớn hơn 0.'
    })
});

const userIdParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'User id phải là số.',
        'number.integer': 'User id phải là số nguyên.',
        'number.positive': 'User id phải lớn hơn 0.',
        'any.required': 'User id là bắt buộc.'
    })
});

const createUserSchema = Joi.object({
    full_name: Joi.string().trim().min(2).max(100).required().messages({
        'string.min': 'Họ tên phải có ít nhất 2 ký tự.',
        'string.max': 'Họ tên không được vượt quá 100 ký tự.',
        'any.required': 'Họ tên là bắt buộc.',
        'string.empty': 'Họ tên là bắt buộc.'
    }),
    email: Joi.string().trim().lowercase().email().max(255).required().messages({
        'string.email': 'Email không đúng định dạng.',
        'string.max': 'Email không được vượt quá 255 ký tự.',
        'any.required': 'Email là bắt buộc.',
        'string.empty': 'Email là bắt buộc.'
    }),
    password: Joi.string().min(6).max(128).required().messages({
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
        'string.max': 'Mật khẩu không được vượt quá 128 ký tự.',
        'any.required': 'Mật khẩu là bắt buộc.',
        'string.empty': 'Mật khẩu là bắt buộc.'
    }),
    role: Joi.string().valid(...USER_ROLES).default('MEMBER').messages({
        'any.only': 'Role phải là ADMIN, PM hoặc MEMBER.'
    }),
    department_id: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'department_id phải là số.',
        'number.integer': 'department_id phải là số nguyên.',
        'number.positive': 'department_id phải lớn hơn 0.'
    })
});

const updateUserSchema = Joi.object({
    full_name: Joi.string().trim().min(2).max(100).optional().messages({
        'string.min': 'Họ tên phải có ít nhất 2 ký tự.',
        'string.max': 'Họ tên không được vượt quá 100 ký tự.'
    }),
    email: Joi.string().trim().lowercase().email().max(255).optional().messages({
        'string.email': 'Email không đúng định dạng.',
        'string.max': 'Email không được vượt quá 255 ký tự.'
    }),
    role: Joi.string().valid(...USER_ROLES).optional().messages({
        'any.only': 'Role phải là ADMIN, PM hoặc MEMBER.'
    }),
    department_id: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': 'department_id phải là số.',
        'number.integer': 'department_id phải là số nguyên.',
        'number.positive': 'department_id phải lớn hơn 0.'
    })
}).min(1).messages({
    'object.min': 'Cần cung cấp ít nhất một trường để cập nhật.'
});

const updateUserStatusSchema = Joi.object({
    status: Joi.string().valid(...USER_STATUSES).required().messages({
        'any.only': 'Status phải là ACTIVE hoặc DISABLED.',
        'any.required': 'Status là bắt buộc.',
        'string.empty': 'Status là bắt buộc.'
    })
});

module.exports = {
    getUsersQuerySchema,
    userIdParamsSchema,
    createUserSchema,
    updateUserSchema,
    updateUserStatusSchema
};
