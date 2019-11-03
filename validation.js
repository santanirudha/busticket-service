const Joi = require('joi');

const min = 1;
const max = 40;

const seatValidation = (data) => {
	return Joi.validate(data, Joi.number().integer().min(min).max(max).required());
};
module.exports.seatValidation = seatValidation;

const typeValidation = (data) => {
	return Joi.validate(data, Joi.string().valid('open').valid('close').required());
};
module.exports.typeValidation = typeValidation;

const loginValidation = (data) => {
	const credentials = {
		email: Joi.string().email().required(),
		password: Joi.string().min(6).max(255).required()
	};
	return Joi.validate(data, credentials);
};
module.exports.loginValidation = loginValidation;

const registerValidation = (data) => {
	const schema = {
		type: Joi.string().valid('admin').valid('user').required(),
		first_name: Joi.string().min(1).required(),
		last_name: Joi.string().min(1).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
		secret_key: Joi.string()
	};

	return Joi.validate(data, schema);
};
module.exports.registerValidation = registerValidation;
