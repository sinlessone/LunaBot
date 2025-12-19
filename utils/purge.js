module.exports = {
    async purge(message, amount) {
        let deletedCount = 0;

        while (deletedCount < amount) {
            const batchSize = Math.min(100, amount - deletedCount);

            const messages = await message.channel.messages.fetch({
                limit: batchSize,
                before: message.id
            });

            const deleted = await message.channel.bulkDelete(messages, true);

            deletedCount += deleted.size;

            if (deleted.size < batchSize) break;

            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return deletedCount
    }
}