const fs = require("fs");
const {GameProfile} = require("./classes");

module.exports = {
	/** @type {Map.<string, GameProfile>} Профили всех пользователей */
	byId: new Map(),
	/** @type {Map.<string, GameProfile>} Профили всех пользователей */
	byName: new Map(),

	load: function() {
		let buf = fs.readFileSync('./storage/profiles.json');
		let data = JSON.parse(buf.toString());

		data.forEach((item) => {
			let profile = new GameProfile(item.uuid, item.name);
			this.byId.set(profile.id, profile);
			this.byName.set(profile.name.toLowerCase(), profile);
		});

		console.log(`Loaded ${this.byId.size} user profiles`);
	},

	/**
	 * Ищет профиль игрока по UUID
	 * @param {string} uuid UUID
	 * @returns {?GameProfile} Профиль
	 */
	getById: function(uuid) {
		return this.byId.get(uuid);
	},

	/**
	 * Ищет профиль игрока по никнейму
	 * @param {string} username Никнейм
	 * @returns {?GameProfile} Профиль
	 */
	getByName: function(username) {
		return this.byName.get(username.toLowerCase());
	}
};