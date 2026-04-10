module.exports = {
    async wait(ms) {
        await new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }
}