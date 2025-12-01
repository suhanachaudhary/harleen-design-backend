
const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().pattern(/^[A-Za-z ]+$/).min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    address: Joi.string().max(150).allow('', null),
    state: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.string().pattern(/^[0-9]{4,10}$/).allow('', null),
    password: Joi.string().min(6).pattern(/[0-9]/).required()
}).unknown(true);

const loginSchema = Joi.object({
    identifier: Joi.string().required(), // email or phone
    password: Joi.string().required()
});

const updateSchema = Joi.object({
    name: Joi.string().pattern(/^[A-Za-z ]+$/).min(3).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    address: Joi.string().max(150).allow('', null).optional(),
    state: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    pincode: Joi.string().pattern(/^[0-9]{4,10}$/).allow('', null).optional(),
    role: Joi.string().valid('user', 'admin').optional(),
    profile_image: Joi.any(),
}).unknown(true);

module.exports = {
    registerSchema,
    loginSchema,
    updateSchema
};
