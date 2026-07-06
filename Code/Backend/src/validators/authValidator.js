const Joi = require('joi');

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

const emailSchema = Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(255)
    .required()
    .messages({
        'string.email': 'Email không đúng định dạng.',
        'any.required': 'Email là bắt buộc.',
        'string.empty': 'Email là bắt buộc.'
    });

const passwordSchema = Joi.string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .required()
    .messages({
        'string.min': `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`,
        'string.max': `Mật khẩu không được vượt quá ${PASSWORD_MAX_LENGTH} ký tự.`,
        'any.required': 'Mật khẩu là bắt buộc.',
        'string.empty': 'Mật khẩu là bắt buộc.'
    });

const loginSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
        'any.required': 'Mật khẩu là bắt buộc.',
        'string.empty': 'Mật khẩu là bắt buộc.'
    })
});

const forgotPasswordSchema = Joi.object({
    email: emailSchema
});

const resetPasswordParamsSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Token là bắt buộc.',
        'string.empty': 'Token là bắt buộc.'
    })
});

const resetPasswordSchema = Joi.object({
    password: passwordSchema
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'Mật khẩu hiện tại là bắt buộc.',
        'string.empty': 'Mật khẩu hiện tại là bắt buộc.'
    }),
    newPassword: passwordSchema
});

module.exports = {
    loginSchema,
    forgotPasswordSchema,
    resetPasswordParamsSchema,
    resetPasswordSchema,
    changePasswordSchema
};
