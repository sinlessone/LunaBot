const {getCountIds} = require("../utils/setcountingids");
const {queryone, db} = require("../utils/db");
const {reply} = require("../utils/wrapper");
const {presets} = require("../data/embed");
module.exports = {
    async handlecountingsabotage(message) {
        if (!getCountIds().includes(message.channel.id)) return
        const {current_number: lastnumber, current_number_message_id: current_number_message_id} = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=?", [message.guild.id])
        if (message.id !== current_number_message_id) return
        const channel = message.channel
        if (!lastnumber) return
        await channel.send({
            embeds: [presets.warning("Counting Sabotage", `The current number is ${Number(lastnumber) + 1}, please continue counting from there`)]
        })
    }
}