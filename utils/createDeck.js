module.exports = {
    createDeck(){
        const suits = ['♠', '♥', '♦', '♣']
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        let deck = []
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({rank, suit})
            }
        }
        return deck
    }
}