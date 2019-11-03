const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Joi = require('joi');
const { seatValidation, typeValidation } = require('../validation');

//View all tickets
router.get('/tickets', async (req, res) => {
	try {
		let tickets = await Ticket.find();
		res.json(tickets);
	} catch (error) {
		res.json({ message: error });
	}
});

//View Ticket Status
router.get('/status/seat/:seat', async (req, res) => {
	// input validation - seat should be a number and between 1-40
	let { error } = seatValidation(req.params.seat);

	if (error) return res.status(404).send(error);

	try {
		let status = await Ticket.findOne({ seat: parseInt(req.params.seat) }).select('status');
		res.json(status);
	} catch (error) {
		res.json({ message: error });
	}
});

//View Details of person owning the ticket
router.get('/details/seat/:seat', async (req, res) => {
	// input validation - seat should be a number and between 1-40
	let { error } = seatValidation(req.params.seat);

	if (error) return res.status(404).send(error);

	try {
		let status = await Ticket.findOne({ seat: parseInt(req.params.seat) })
			.select('status')
			.select('first_name')
			.select('last_name')
			.select('gender')
			.select('email')
			.select('mobile');
		res.json(status);
	} catch (error) {
		res.json({ message: error });
	}
});

// adding empty seats
router.post('/add', async (req, res) => {
	// input validation - seat should be a number and between 1-40
	let { error } = seatValidation(req.body);

	if (error) return res.status(404).send(error);

	let ticket = new Ticket({
		seat: req.body.seat,
		status: 'open'
	});

	let ticketSaved = await ticket.save();
	try {
		res.json(ticketSaved);
	} catch (error) {
		res.json({ message: error });
	}
});

//View all open tickets
router.get('/tickets/open', async (req, res) => {
	try {
		let tickets = await Ticket.find({ status: 'open' });
		res.json(tickets);
	} catch (error) {
		res.json({ message: error });
	}
});

//View all closed tickets
router.get('/tickets/closed', async (req, res) => {
	try {
		let tickets = await Ticket.find({ status: 'close' });
		res.json(tickets);
	} catch (error) {
		res.json({ message: error });
	}
});

//Update the ticket status (open/close + adding user details)
router.put('/status/:seat/:type', async (req, res) => {
	// input validation - seat should be a number and between 1-40
	let { seatError } = seatValidation(req.params.seat);

	if (seatError) return res.status(404).send(seatError);

	// input validation - type should be a string and should be 'open' or 'close'
	let { typeError } = typeValidation(req.params.type);

	if (typeError) return res.status(400).send(typeError);

	try {
		let type = req.params.type;
		if (type === 'open') {
			try {
				let ticket = await Ticket.updateOne(
					{ seat: req.params.seat },
					{
						$set: { status: 'open' },
						$unset: { first_name: 1, last_name: 1, gender: 1, email: 1, mobile: 1 }
					}
				);
				res.json(ticket);
			} catch (error) {
				res.json({ message: error });
			}
		} else if (type === 'close') {
			// input validation - type should be a string and should be 'open' or 'close'
			let ticketSchema = {
				first_name: Joi.string().min(3).required(),
				last_name: Joi.string().min(3).required(),
				gender: Joi.string().valid('M').valid('F').valid('U').required(),
				email: Joi.string().email().required(),
				mobile: Joi.number().integer().min(1000000000).max(9999999999).required()
			};

			let validation = Joi.validate(req.body, ticketSchema);

			if (validation.error) {
				res.status(400).send(validation.error);
				return;
			}

			try {
				let ticket = await Ticket.updateOne(
					{ seat: req.params.seat },
					{
						$set: {
							status: 'close',
							first_name: req.body.first_name,
							last_name: req.body.last_name,
							gender: req.body.gender,
							email: req.body.email,
							mobile: req.body.mobile
						}
					}
				);
				res.json(ticket);
			} catch (error) {
				res.json({ message: error });
			}
		}
	} catch (error) {
		res.json({ message: error });
	}
});

module.exports = router;
