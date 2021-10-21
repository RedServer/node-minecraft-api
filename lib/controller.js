'use strict';

const fetch = require("node-fetch");
const helpers = require("./helpers");
const {ApiError, GameProfile} = require("./classes");

module.exports = {
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

	hasJoined: function(request, response) {
		if (!request.query.serverId) throw new ApiError('Missing serverId');
		if (!request.query.username) throw new ApiError('Missing username');

		let profile = profileService.getByName(request.query.username);
		if (!(profile && profile.name === request.query.username)) throw new ApiError('Profile not found');
		if (request.query.serverId !== profile.serverId) throw new ApiError('Server ID not match');

		console.log(`Accepted join for '${profile.name}/${profile.id}'`);
		response.json(profile); // Success
	},

	profile: function(request, response) {
		if (!request.params.uuid) throw new ApiError('Missing profile UUID');

		this._fetchProfile(helpers.parseUuid(request.params.uuid)).then(profile => {
			if (profile) {
				let result = Object.assign({}, profile);
				result.id = helpers.removeDashes(result.id);
				response.json(result);
			} else {
				response.status(204); // No content
				response.end();
			}
		});
	},

	getProfiles: function(request, response) {
		if (!(typeof request.body === 'object' && request.body.length > 0)) throw new ApiError('Invalid request');

		this._resolveNames(request.body).then(result => {
			const json = [];
			for (let profile of result) {
				json.push({id: helpers.removeDashes(profile.id), name: profile.name});
			}

			response.json(json);

		}).catch(e => {
			if (e instanceof ApiError) {
				const result = {error: e.type, errorMessage: e.message};
				console.warn('Mojang returned error:', result);
				response.json(result);
			} else {
				throw e; // Бросаем дальше
			}
		});
	},

	/**
	 * Ищет профиль игрока
	 * @param {string} uuid UUID с разделителям
	 * @return {Promise<?GameProfile>}
	 * @private
	 */
	_fetchProfile: async function(uuid) {
		let profile = profileService.getById(uuid);
		if (profile) return profile;

		/* Делаем запрос к Mojang, если нет в локальной базе */
		console.info(`Fetching profile '${uuid}' from Mojang`);

		let response = await fetch('https://sessionserver.mojang.com/session/minecraft/profile/' + helpers.removeDashes(uuid), {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			}
		});

		let json = await this._parseMojangResponse(response);
		if (json === null) return null; // Не существует

		profile = new GameProfile(helpers.parseUuid(json.id), json.name);
		if (typeof json.properties === 'object') profile.properties = json.properties;

		return profile;
	},

	/**
	 * Возвращает список профилей по именам игроков
	 * @param {Array<String>} names Имена игроков
	 * @return {Promise<Array<GameProfile>>} Найденные профили
	 * @private
	 */
	_resolveNames: async function(names) {
		const result = [];
		const missingNames = [];

		for (let name of names) {
			let profile = profileService.getByName(name);
			if (profile) {
				result.push(profile);
			} else {
				missingNames.push(name);
			}
		}

		/* Делаем запрос к Mojang, если нет в локальной базе */
		if (missingNames.length > 0) {
			console.info(`Fetching UUID for [${missingNames.join(', ')}] from Mojang`);

			let response = await fetch('https://api.mojang.com/profiles/minecraft', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json; charset=utf-8'
				},
				body: JSON.stringify(missingNames),
			});
			let json = await this._parseMojangResponse(response);

			for (let item of json) {
				result.push(new GameProfile(helpers.parseUuid(item.id), item.name));
			}
		}

		return result;
	},

	/**
	 * Парсит ответ Mojang и возвращает JSON
	 * @param {Response} response
	 * @throws {ApiError} При возврате ошибки API
	 * @return {Promise<?Object>}
	 * @private
	 */
	_parseMojangResponse: async function(response) {
		if (response.status === 204) return null; // No content
		let json = await response.json();

		if (json.error) {
			const err = new ApiError(json.errorMessage);
			err.type = json.error;
			throw err;
		}

		return json;
	},
};