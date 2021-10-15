/**
 * Формат ответа-ошибки API
 * @param {string} message
 * @returns {{errorMessage: string, error: string}}
 */
module.exports.errorResponse = function(message) {
	return {error: 'InvalidRequestException', errorMessage: message};
}

/**
 * Добавляет разделители в строку UUID
 * @param {string} input
 * @returns {string}
 */
module.exports.parseUUID = function(input) {
	input = input.toLowerCase();
	if (input.length === 36) return input; // отформатирована уже
	if (input.length !== 32) throw new Error('Invalid UUID length');
	return input.substr(0, 8) + '-' + input.substr(8, 4) + '-' + input.substr(12, 4) + '-' + input.substr(16, 4) + '-' + input.substr(20);
}