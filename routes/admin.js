const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

//Additional API for admin to reset the server (opens up all the tickets)
router.put('/reset', async (req, res) => {
	try {
		let ticket = await Ticket.updateMany(
			{ status: 'close' },
			{ $set: { status: 'open' }, $unset: { first_name: 1, last_name: 1, gender: 1 } }
		);
		res.json(ticket);
	} catch (error) {
		res.json({ message: error });
	}
});

module.exports = router;
