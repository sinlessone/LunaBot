const {initDb, queryone, db,
} = require("./db");
const {fixConfig} = require("./fixconfig");
const fs = require("fs");
const path = require("path")
const chalk = require("chalk");
const {getSuggestIds,} = require("./setsuggestids");
const {listen} = require("../smee/server");
const loadChannels = require("./loadChannels");
const { startSmee } = require("./startSmee");
module.exports = {
    async init(client, configpath) {
        await startSmee()

        await listen(client)
        await initDb();
        await loadChannels()
        await fixConfig();
        const config = JSON.parse(fs.readFileSync(path.resolve(configpath)));
        if (!config.ownerID) {
            console.warn(chalk.bgYellow.black('[WARN] config.ownerID is not defined! Owner-only commands will block all users.'));
        }
        await client.login(process.env.DISCORD_TOKEN)
        const serversData = await client.guilds.cache
        const serverIds = serversData.map(filter => filter.id)
        for (let id of serverIds) {
            let suggestionIds = getSuggestIds()
            const serverconfig = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=?", [id])
            if (serverconfig) suggestionIds.push(serverconfig.suggestionchannelid)
        }
    }
}