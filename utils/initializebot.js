const {getaichannels, initDb, getsuggestchannels, queryone, db, getcountingchannels, execute} = require("./db");
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
        const fallbackQuestions = [
            "If you could have any superpower, but it had to be really mundane/boring, what would it be?",
            "Pineapple on pizza: Genius or Crime against humanity?",
            "What is the last song you listened to?",
            "If you could instantly master one skill without practicing, what would it be?",
            "Coffee or Tea?",
            "What was your favorite cartoon growing up?",
            "If you were a potato, how would you like to be cooked?",
            "What is your most used emoji?",
            "Would you rather fight one horse-sized duck or 100 duck-sized horses?",
            "What is the weirdest food combination you actually enjoy?",
            "Morning bird or Night owl?",
            "If you could travel anywhere in the world right now, where would you go?",
            "Video Games: Console or PC?",
            "What is one movie you can watch over and over again without getting tired of it?",
            "If you had to eat one meal for the rest of your life, what would it be?",
            "Cats or Dogs?",
            "What is the worst advice you have ever received?",
            "If animals could talk, which one would be the rudest?",
            "Dark Mode or Light Mode?",
            "What is a trend that you just do not understand?",
            "If you were a ghost, who or what would you haunt?",
            "What was the first video game you ever played?",
            "Would you rather always be 10 minutes late or always be 20 minutes early?",
            "What is your 'comfort' TV show?",
            "If you could have dinner with any historical figure, who would it be?",
            "Winter or Summer?",
            "What is the background wallpaper on your phone right now?",
            "If you won the lottery today, what is the first *frivolous* thing you would buy?",
            "Texting or Calling?",
            "If your life was a movie, what genre would it be?"
        ];
        for (const item of fallbackQuestions) {
            try {
                await execute(db, "INSERT INTO qotd(question, used) VALUES (?, 0)", [item])
            } catch (e) {}
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