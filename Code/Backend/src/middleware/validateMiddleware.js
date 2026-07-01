/**
 * Middleware validate request bằng Joi.
 *
 * Cách dùng:
 * router.post('/login', validate({ body: loginSchema }), controller.login)
 */
const validate = (schemas) => {
    return (req, res, next) => {
        const validationTargets = ['body', 'params', 'query'];

        for (const target of validationTargets) {
            if (!schemas[target]) {
                continue;
            }

            const { error, value } = schemas[target].validate(req[target], {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });

            if (error) {
                const details = error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu đầu vào không hợp lệ.',
                    data: null,
                    errors: details
                });
            }

            req[target] = value;
        }

        next();
    };
};

module.exports = { validate };
