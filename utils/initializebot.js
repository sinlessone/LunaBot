const {getaichannels, initDb, getsuggestchannels, queryone, db, getcountingchannels} = require("./db");
const {fixConfig} = require("./fixconfig");
const fs = require("fs");
const path = require("path")
const chalk = require("chalk");
const {setAiIds} = require("./setaiids");
const {getSuggestIds} = require("./setsuggestids");
const {setCountIds} = require("./setcountingids");
module.exports = {
    async init( client, configpath) {
        await initDb();
        const aichannels = await getaichannels()
        const countchannels = await getcountingchannels()
        setAiIds(aichannels.map(item => item.ai_channel_id))
        setCountIds(countchannels.map(item => item.counting_channel_id))
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
            if (serverconfig) suggestionIds.push(serverconfig.suggestionChannelId)
        }
    }
}