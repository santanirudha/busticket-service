const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	type: String,
	first_name: String,
	last_name: String,
	email: String,
	password: String,
	secret_key: String
});

module.exports = mongoose.model('User', UserSchema);
