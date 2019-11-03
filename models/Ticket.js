const mongoose = require('mongoose');

const TicketSchema = mongoose.Schema({
	seat: Number,
	status: String,
	first_name: String,
	last_name: String,
	gender: String,
	email: String,
	mobile: Number
});

module.exports = mongoose.model('Ticket', TicketSchema);
