// ai generated cba to do ts


function parseRoman(str) {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const upper = str.toUpperCase();
    let num = 0;

    for (let i = 0; i < upper.length; i++) {
        const curr = map[upper[i]];
        const next = map[upper[i + 1]];
        if (next > curr) num -= curr;
        else num += curr;
    }
    return num;
}

/**
 * Main Conversion Function
 * @param {string|number} input - The input string (e.g., "١٢٣", "XIV", "۵")
 * @returns {number} - The parsed number, or NaN if invalid
 */
function parseAnyNumber(input) {
    if (typeof input === 'number') return input;
    if (!input) return NaN;

    let str = String(input).trim();

    // 1. Digit Normalization
    // We use a regex range that covers the lowest unicode digit to the highest relevant one
    // and replace them mathematically based on the ZERO_OFFSETS.
    str = str.replace(/[٠-٩۰-۹०-९０-９]/g, (char) => {
        const code = char.charCodeAt(0);
        // Determine which range this character falls into
        if (code >= 0x0660 && code <= 0x0669) return code - 0x0660; // Arabic
        if (code >= 0x06F0 && code <= 0x06F9) return code - 0x06F0; // Persian
        if (code >= 0x0966 && code <= 0x096F) return code - 0x0966; // Devanagari
        if (code >= 0xFF10 && code <= 0xFF19) return code - 0xFF10; // Full-width
        return char;
    });

    // 2. Try Standard Number Parsing
    // If the replacement resulted in a standard number (e.g. "123"), return it.
    const parsed = parseFloat(str);
    if (!isNaN(parsed) && isFinite(str)) { // isFinite check ensures we don't return number for "123abc"
        return parsed;
    }

    // 3. Try Roman Numeral Parsing
    // Check if string contains ONLY Roman characters (I, V, X, L, C, D, M)
    if (/^[IVXLCDM]+$/i.test(str)) {
        return parseRoman(str);
    }

    // 4. Failed
    return NaN;
}

// --- Export Logic ---

// Support CommonJS (Node.js)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = parseAnyNumber;
}
