'use strict';

const express = require('express');
const profileService = require('./lib/profileService');
const helpers = require('./lib/helpers');

profileService.load();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', function(request, response) {
	response.contentType('text');
	response.send('Server working!')
});

app.post('/minecraft/join', function(request, response) {
	if (request.body.selectedProfile) {
		if (request.body.serverId) {

			let uuid = helpers.parseUUID(request.body.selectedProfile);
			let profile = profileService.getById(uuid);

			console.log(`Join request from '${uuid}'`);

			if (profile) {
				profile.serverId = request.body.serverId;
				response.json({id: profile.id, name: profile.name}); // Success

			} else response.json(helpers.errorResponse('Profile not found'));
		} else response.json(helpers.errorResponse('Missing serverId'));
	} else response.json(helpers.errorResponse('Missing selectedProfile'));
});

app.get('/minecraft/hasJoined', function(request, response) {
	if (request.query.serverId) {
		if (request.query.username) {

			let profile = profileService.getByName(request.query.username);
			if (profile && profile.name === request.query.username) {
				if (request.query.serverId === profile.serverId) {

					console.log(`Accepted join for '${profile.name}/${profile.id}'`);
					response.json(profile); // Success

				} else response.json(helpers.errorResponse('Server ID not match'));
			} else response.json(helpers.errorResponse('Profile not found'));
		} else response.json(helpers.errorResponse('Missing username'));
	} else response.json(helpers.errorResponse('Missing serverId'));
});

app.get('/minecraft/profile/:uuid', function(request, response) {
	if (request.params.uuid) {
		let profile = profileService.getById(helpers.parseUUID(request.params.uuid));
		if (profile) {
			response.json(profile);
		} else response.json(helpers.errorResponse('User not found'));
	} else response.json(helpers.errorResponse('Missing profile UUID'));
});

app.post('/minecraft/getProfiles', function(request, response) {
	if (typeof request.body === 'object' && request.body.length > 0) {
		let result = [];

		for (let name of request.body) {
			let profile = profileService.getByName(name);
			if (profile) result.push({id: profile.id, name: profile.name});
		}

		response.json(result);

	} else response.json(helpers.errorResponse('Invalid request'));
});

app.use('/favicon.ico', express.static('favicon.ico'));

app.listen(port, function() {
	console.log(`Server running at http://localhost:${port}`)
});
