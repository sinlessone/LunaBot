/**
 * takes a string composed of a number and a shorthand time suffix and returns time in milliseconds
 * @param {string} timeInput - a string containing a number only (assumed to be hours) or a number with a suffix, for example 4d
 * @returns {number, null}  - returns milliseconds
 */
module.exports = {
    parseTimeToMs(timeInput) {
        if (timeInput === null || timeInput === undefined) {
            return null;
        }

        let str = String(timeInput).trim();

        if (/^\d+(?:\.\d+)?$/.test(str)) {
            str += 'h';
        }

        const match = str.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
        if (!match) {
            return null;
        }

        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();

        const msMap = {
            'ms': 1,
            's': 1000,
            'm': 1000 * 60,
            'h': 1000 * 60 * 60,
            'd': 1000 * 60 * 60 * 24,
            'w': 1000 * 60 * 60 * 24 * 7,
            'y': 1000 * 60 * 60 * 24 * 365
        };

        if (unit in msMap) {
            return value * msMap[unit];
        }

        return null;
    }
}