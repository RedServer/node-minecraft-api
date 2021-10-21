module.exports = {
	/**
	 * Добавляет разделители в строку UUID
	 * @param {string} input
	 * @returns {string}
	 */
	parseUuid: function(input) {
		input = input.toLowerCase();
		if (input.length === 36) return input; // отформатирована уже
		if (input.length !== 32) throw new Error('Invalid UUID length');
		return input.substr(0, 8) + '-' + input.substr(8, 4) + '-' + input.substr(12, 4) + '-' + input.substr(16, 4) + '-' + input.substr(20);
	},

	/**
	 * Убирает разделители из строку
	 * @param {string} input
	 * @returns {string}
	 */
	removeDashes: function(input) {
		return input.replace(/-/g, '');
	}
}
