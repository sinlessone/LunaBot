const {getCountIds} = require("../utils/setcountingids");
const {queryone, db} = require("../utils/db");
const {reply} = require("../utils/wrapper");
const {presets} = require("../data/embed");
module.exports = {
    async handlecountingsabotage(message) {
        if (!getCountIds().includes(message.channel.id)) return
        const {current_number: lastnumber} = await queryone(db, "SELECT current_number FROM serverconfig WHERE server_id=?", [message.guild.id])
        console.log(lastnumber)
        const channel = message.channel
        if (!lastnumber) return
        await channel.send({
            embeds: [presets.warning("Counting Sabotage", `The current number is ${lastnumber + 1}, please continue counting from there`)]
        })
    }
}