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

module.exports.GameProfile = GameProfile;