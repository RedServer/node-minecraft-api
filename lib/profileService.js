const fs = require("fs");
const path = require('path');
const crypto = require('crypto');
const helpers = require("./helpers");
const {GameProfile} = require("./classes");

module.exports = {
	/** @type {Map.<string, GameProfile>} Профили всех пользователей */
	byId: new Map(),
	/** @type {Map.<string, GameProfile>} Профили всех пользователей */
	byName: new Map(),
	skinsDir: './storage/skins',
	capesDir: './storage/capes',
	texturesDir: './storage/textures',

	/**
	 * Загружает список профилей игроков
	 * @return {VoidFunction}
	 */
	load: function() {
		let buf = fs.readFileSync('./storage/profiles.json');
		let data = JSON.parse(buf.toString());

		data.forEach((item) => {
			let profile = new GameProfile(item.uuid, item.name);
			this.byId.set(profile.id, profile);
			this.byName.set(profile.name.toLowerCase(), profile);
		});

		console.log(`Loaded ${this.byId.size} user profiles`);
		this._loadTextures();
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
	},

	/**
	 * Загружает текстуры игроков
	 * @return {VoidFunction}
	 * @private
	 */
	_loadTextures: async function() {
		// Проверка существования папок
		if (!fs.existsSync(this.skinsDir)) fs.mkdirSync(this.skinsDir);
		if (!fs.existsSync(this.capesDir)) fs.mkdirSync(this.capesDir);
		if (!fs.existsSync(this.texturesDir)) fs.mkdirSync(this.texturesDir);

		for (let profile of this.byName.values()) {
			let skinPath = this.skinsDir + '/' + profile.name + '.png';
			let capePath = this.capesDir + '/' + profile.name + '.png';

			const properties = {
				timestamp: 0,
				profileId: helpers.removeDashes(profile.id),
				profileName: profile.name,
				textures: {}
			};

			if (fs.existsSync(skinPath)) {
				console.debug('* Found skin for: ' + profile.name);
				const hash = this._hashFile(skinPath);
				this._copyTextureToCache(skinPath, hash);

				properties.textures['SKIN'] = {url: this._getTextureUrl(hash)};
			}

			if (fs.existsSync(capePath)) {
				console.debug('* Found cape for: ' + profile.name);
				const hash = this._hashFile(capePath);
				this._copyTextureToCache(capePath, hash);

				properties.textures['CAPE'] = {url: this._getTextureUrl(hash)};
			}

			// Добавляем свойства в профиль
			profile.properties.push({
				name: 'textures',
				value: Buffer.from(JSON.stringify(properties)).toString('base64')
			});
		}
	},

	/**
	 * Вычисляет хеш файла
	 * @param {string} path
	 * @return {string}
	 * @private
	 */
	_hashFile: function(path) {
		return crypto.createHash('sha256')
			.update(fs.readFileSync(path))
			.digest('hex');
	},

	/**
	 * Получить URL текстуры
	 * @param {string} hash Хеш текстуры
	 * @return {string}
	 * @private
	 */
	_getTextureUrl: function(hash) {
		return getServerUrl() + '/textures/' + hash.substr(0, 2) + '/' + hash.substr(2) + '.png';
	},

	/**
	 * Получить путь к файлу текстуры
	 * @param {string} hash Хеш текстуры
	 * @return {string}
	 * @private
	 */
	_getTexturePath: function(hash) {
		return this.texturesDir + '/' + hash.substr(0, 2) + '/' + hash.substr(2) + '.png';
	},
	/**
	 * Копирует файл текстуры в хранилище всех текстур
	 * @param {string} srcPath Путь к исходному файлу
	 * @param {string} hash Хеш текстуры
	 * @private
	 */
	_copyTextureToCache: function(srcPath, hash) {
		const destPath = this._getTexturePath(hash);
		const dir = path.dirname(destPath);

		if (fs.existsSync(destPath)) return;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);

		fs.copyFile(srcPath, destPath, fs.constants.COPYFILE_EXCL, function() {
			console.info(`Copied texture '${srcPath}' to '${destPath}'`);
		});
	}
};