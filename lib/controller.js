'use strict';

const helpers = require("./helpers");
const {ApiError} = require("./classes");

module.exports = {
	/**
	 * @return {VoidFunction}
	 */
	join: function(request, response) {
		if (!request.body['selectedProfile']) throw new ApiError('Missing selectedProfile');
		if (!request.body['serverId']) throw new ApiError('Missing serverId');

		let uuid = helpers.parseUuid(request.body['selectedProfile']);
		let profile = profileService.getById(uuid);
		console.log(`Join request from '${uuid}'`);

		if (!profile) throw new ApiError('Profile not found');

		profile.serverId = request.body['serverId'];

		response.json({id: profile.id, name: profile.name});
	},

	/**
	 * @return {VoidFunction}
	 */
	hasJoined: function(request, response) {
		if (!request.query.serverId) throw new ApiError('Missing serverId');
		if (!request.query.username) throw new ApiError('Missing username');

		let profile = profileService.getByName(request.query.username);
		if (!(profile && profile.name === request.query.username)) throw new ApiError('Profile not found');
		if (request.query.serverId !== profile.serverId) throw new ApiError('Server ID not match');

		console.log(`Accepted join for '${profile.name}/${profile.id}'`);
		response.json(profile); // Success
	},

	/**
	 * @return {VoidFunction}
	 */
	profile: function(request, response) {
		if (!request.params.uuid) throw new ApiError('Missing profile UUID');
		let profile = profileService.getById(helpers.parseUuid(request.params.uuid));
		if (!profile) throw new ApiError('User not found');

		response.json(profile);
	},

	/**
	 * @return {VoidFunction}
	 */
	getProfiles: function(request, response) {
		if (!(typeof request.body === 'object' && request.body.length > 0)) throw new ApiError('Invalid request');
		let result = [];

		for (let name of request.body) {
			let profile = profileService.getByName(name);
			if (profile) result.push({id: profile.id, name: profile.name});
		}

		response.json(result);
	}
};