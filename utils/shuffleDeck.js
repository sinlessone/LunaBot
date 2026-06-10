module.exports = {
     shuffleDeck(deck){
        return deck = deck.sort(() => Math.random() - 0.5);
    }
}