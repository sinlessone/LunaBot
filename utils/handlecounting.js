const {queryone, db, execute} = require("./db");
const {presets} = require("../data/embed");
const parseAnyNumber = require("./toArabicNum");
module.exports = {
    async handlecounting(message) {
        let msg = message.content.toString().toLowerCase().split(" ")
        msg[0] = msg[0].replaceAll("sex", "6") // funny suggested by drip
        msg[0] = parseAnyNumber(msg[0])
        console.log(msg[0])
        if (/\D/.test(msg[0])) return
        let {current_number: lastnumber, last_counter: lastcounter} = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=?", [message.guild.id])
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
            return await message.react("✅")
        } else {
            if (Number(lastnumber) === 0) {
                await message.react("❌")
                return await message.reply({
                    embeds: [presets.warning("", "the current number is 1, please start over again")]
                }).then(newmessage => {
                    setTimeout(async () => {
                        await newmessage.delete()
                    }, 3000)
                })

            }
            await message.react("❌")
            await message.reply({
                embeds: [presets.warning("FAIL", `<@${message.member.id}> messed up the count, the correct number was ${Number(lastnumber) + 1}`)]
            })
            await execute(db, "UPDATE serverconfig SET current_number=?, last_counter=?, altered_count=? WHERE server_id=?", [0, 0, 0, message.guild.id])

        }



    }
}