const {queryone, db} = require("../utils/db");
const {presets} = require("../data/embed");
exports.handleJoin = async (client, member) => {
    try {
        const {joinchannelid, joinroleid, joindata} = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=$1", [member.guild.id]);
        console.log(joindata)


        if (joinroleid) {
            await member.roles.add(joinroleid)
        }
        if (joinchannelid) {
            const channel = await client.channels.fetch(joinchannelid);
            await channel.send({
                embeds: [presets.success("", joindata.description.replaceAll("$user", `<@${member.id}>`).replaceAll("$server", member.guild.name).replaceAll("$br", "\n")).setAuthor({
                    name: joindata.title,
                    iconURL: member.user.displayAvatarURL(),
                })],
            })
        }

    } catch (e) {
        console.log(e)
    }
    

}