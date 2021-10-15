'use strict';

const express = require('express');
const {ApiError} = require("./lib/classes");
const controller = require('./lib/controller');

global.profileService = require('./lib/profileService');
profileService.load();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', function(request, response) {
	response.contentType('text');
	response.send('Server working!')
});

app.post('/minecraft/join', controller.join);
app.get('/minecraft/hasJoined', controller.hasJoined);
app.get('/minecraft/profile/:uuid', controller.profile);
app.post('/minecraft/getProfiles', controller.getProfiles);
app.use('/favicon.ico', express.static('favicon.ico'));

// Middleware
app.use((error, request, response, next) => {
	if (error instanceof ApiError) {
		response.json({error: 'InvalidRequestException', errorMessage: error.message});
	} else {
		next(error);
	}
});

app.listen(port, function() {
	console.log(`Server running at http://localhost:${port}`)
});
