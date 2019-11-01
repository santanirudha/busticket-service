const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Joi = require('joi');

const min = 1;
const max = 40;

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
	let seatValidation = Joi.validate(req.params.seat, Joi.number().min(min).max(max).required());

	if (seatValidation.error) {
		res.status(404).send(seatValidation.error);
		return;
	}
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
	let seatValidation = Joi.validate(req.params.seat, Joi.number().min(min).max(max).required());

	if (seatValidation.error) {
		res.status(404).send(seatValidation.error);
		return;
	}

	try {
		let status = await Ticket.findOne({ seat: parseInt(req.params.seat) })
			.select('status')
			.select('first_name')
			.select('last_name')
			.select('gender');
		res.json(status);
	} catch (error) {
		res.json({ message: error });
	}
});

// adding empty seats
router.post('/add', async (req, res) => {
	// input validation - seat should be a number and between 1-40
	let seatValidation = Joi.validate(req.body.seat, Joi.number().min(min).max(max).required());

	if (seatValidation.error) {
		res.status(400).send(seatValidation.error);
		return;
	}
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
	let seatValidation = Joi.validate(req.params.seat, Joi.number().min(min).max(max).required());

	if (seatValidation.error) {
		res.status(400).send(seatValidation.error);
		return;
	}

	// input validation - type should be a string and should be 'open' or 'close'
	let typeValidation = Joi.validate(req.params.type, Joi.string().valid('open').valid('close').required());

	if (typeValidation.error) {
		res.status(400).send(typeValidation.error);
		return;
	}

	try {
		let type = req.params.type;
		if (type === 'open') {
			try {
				let ticket = await Ticket.updateOne(
					{ seat: req.params.seat },
					{ $set: { status: 'open' }, $unset: { first_name: 1, last_name: 1, gender: 1 } }
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
				gender: Joi.string().valid('M').valid('F').valid('U').required()
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
							gender: req.body.gender
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

// request params
router.get('/tickets/:first_name/:last_name', (req, res) => {
	let first_name = req.params.first_name;
	let last_name = req.params.last_name;
	res.send(first_name + ' ' + last_name);
});

// query params
router.get('/tickets/:first_name/', (req, res) => {
	res.send(req.query);
});

module.exports = router;
