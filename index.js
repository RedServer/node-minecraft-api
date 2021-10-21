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

app.post('/minecraft/join', (req, res) => controller.join(req, res));
app.get('/minecraft/hasJoined', (req, res) => controller.hasJoined(req, res));
app.get('/minecraft/profile/:uuid', (req, res) => controller.profile(req, res));
app.post('/minecraft/getProfiles', (req, res) => controller.getProfiles(req, res));

app.use('/textures', express.static('./storage/textures'));
app.use('/favicon.ico', express.static('favicon.ico'));

// Middleware
app.use((error, request, response, next) => {
	if (error instanceof ApiError) {
		response.json({error: error.type, errorMessage: error.message});
	} else {
		next(error);
	}
});

app.listen(serverPort, function() {
	console.log(`Server running at ${getServerUrl()}`)
});
