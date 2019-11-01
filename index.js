const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');
const apiRoute = require('./routes/api');
const adminRoute = require('./routes/admin');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening to port ${port}`));
app.use(bodyParser.json());
app.use('/api', apiRoute);
app.use('/admin', adminRoute);

const options = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,

	autoIndex: false, // Don't build indexes
	reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
	reconnectInterval: 500, // Reconnect every 500ms
	poolSize: 10, // Maintain up to 10 socket connections
	// If not connected, return errors immediately rather than waiting for reconnect
	bufferMaxEntries: 0,
	connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
	socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
	family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect(process.env.DB_CONNECTION, options).then(
	() => {
		console.log('db connected');
	},
	(err) => {
		console.log('connection error');
	}
);
