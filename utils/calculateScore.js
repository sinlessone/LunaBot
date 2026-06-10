/**
 * Calculates the best possible Blackjack score for a hand of cards.
 * @param {Array} hand - An array of card objects, e.g., [{ rank: 'A', suit: '♠️' }, { rank: '5', suit: '♥️' }]
 * @returns {number} - The total score
 */
function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;

    for (const card of hand) {
        const rank = card.rank;

        if (rank === 'A') {
            aceCount += 1;
            score += 11;
        } else if (['J', 'Q', 'K'].includes(rank)) {
            score += 10;
        } else {
            score += parseInt(rank);
        }
    }

    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount -= 1;
    }

    return score;
}

module.exports = { calculateScore };