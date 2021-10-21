'use strict';

class GameProfile {
	/**
	 * @param {string} id UUID
	 * @param {string} name Никнейм
	 */
	constructor(id, name) {
		this.id = id;
		this.name = name;
		this.properties = [];
	}
}

class ApiError extends Error {
	constructor(message) {
		super(message);
		this.name = "ApiError";
		this.type = "InvalidRequestException";
	}
}

module.exports = {GameProfile, ApiError};