const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { loginValidation, registerValidation } = require('../validation');
const bcrypt = require('bcryptjs');

//Additional API for admin to reset the server (opens up all the tickets)
router.put('/reset', async (req, res) => {
	// credentials validation
	let { error } = loginValidation(req.body);
	if (error) return res.status(400).send(error);

	let user = await User.findOne({ type: 'admin', email: req.body.email });
	if (!user) return res.status(401).send('Access only to Admins');

	let passCheck = await bcrypt.compare(req.body.password, user.password);
	if (!passCheck) return res.status(401).send('Access Denied!');

	try {
		let ticket = await Ticket.updateMany(
			{ status: 'close' },
			{ $set: { status: 'open' }, $unset: { first_name: 1, last_name: 1, gender: 1, email: 1, mobile: 1 } }
		);
		res.json(ticket);
	} catch (error) {
		res.json({ message: error });
	}
});

// Register Admin
router.post('/register', async (req, res) => {
	// user register validation
	let { error } = registerValidation(req.body);

	if (error) return res.status(400).send(error);

	let adminEmail = await User.findOne({ type: 'admin', email: req.body.email });
	if (adminEmail) return res.status(400).send('the admin already exists');

	if (req.body.secret_key == null) return res.status(400).send('provide a secret key');
	if (req.body.secret_key != process.env.SECRET_KEY) return res.status(404).send('invalid secret key');

	let salt = await bcrypt.genSalt(10);
	let hashedPassword = await bcrypt.hash(req.body.password, salt);

	let admin = new User({
		type: 'admin',
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		password: hashedPassword
	});

	let savedUser = await admin.save();
	res.json({ registered: true });
});

module.exports = router;
