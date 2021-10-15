'use strict';

const express = require('express');
const {ApiError} = require("./lib/classes");
const controller = require('./lib/controller');

const app = express();
const serverUrl = 'http://localhost';
const serverPort = 3000;

global.getServerUrl = function() {
	return serverUrl + (serverPort === 80 ? '' : ':' + serverPort);
};

global.profileService = require('./lib/profileService');
profileService.load();

app.use(express.json()); // Парсер JSON Body

app.get('/', function(request, response) {
	response.contentType('text');
	response.send('Server working!')
});

app.post('/minecraft/join', controller.join);
app.get('/minecraft/hasJoined', controller.hasJoined);
app.get('/minecraft/profile/:uuid', controller.profile);
app.post('/minecraft/getProfiles', controller.getProfiles);

app.use('/textures', express.static('./storage/textures'));
app.use('/favicon.ico', express.static('favicon.ico'));

// Middleware
app.use((error, request, response, next) => {
	if (error instanceof ApiError) {
		response.json({error: 'InvalidRequestException', errorMessage: error.message});
	} else {
		next(error);
	}
});

app.listen(serverPort, function() {
	console.log(`Server running at ${getServerUrl()}`)
});
