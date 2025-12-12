const {queryone, db, execute} = require("./db");
const {presets} = require("../data/embed");
module.exports = {
    async handlecounting(message) {
        let msg = message.content.toString().split(" ")
        if (/\D/.test(msg[0])) return
        let {current_number: lastnumber, last_counter: lastcounter} = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=?", [message.guild.id])
        console.log(lastnumber)
        if (!lastnumber) {
            lastnumber = 0
        }

        if (lastcounter === message.member.id) {
            return await message.reply({
                embeds: [presets.warning("", "You cannot count twice in a row")]
            }).then(newmessage => {
                setTimeout(async () => {
                    await newmessage.delete()
                    await message.delete()
                }, 3000)
            })
        }


        if (Number(msg[0]) === Number(lastnumber) + 1) {
            await execute(db, "UPDATE serverconfig SET current_number=?, last_counter=? WHERE server_id=?", [Number(lastnumber) + 1, message.member.id, message.guild.id])
            return message.react("✅")
        } else {
            await message.react("❌")
            await message.reply({
                embeds: [presets.warning("", `Incorrect, the current number is ${Number(lastnumber) + 1}`)]
            }).then(newmessage => {
                setTimeout(async () => {
                    await newmessage.delete()
                    await message.delete()
                }, 3000 )
            })

        }



    }
}