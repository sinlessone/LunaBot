const {queryone, db} = require("../utils/db");
const {presets} = require("../data/embed");
exports.handleJoin = async (client, member) => {
    console.log(member);
    try {
        const {joinchannelid, joinroleid} = await queryone(db, "SELECT * FROM serverconfig WHERE server_id=$1", [member.guild.id]);
        const channel = await client.channels.fetch(joinchannelid);
        console.log(member.user.displayAvatarURL());
        await member.roles.add(joinroleid)
        await channel.send({
            embeds: [presets.success("", `hope you have a great stay here <@${member.user.id}>!\n We now have ${member.guild.memberCount} members!`).setAuthor({
                name: "Welcome to the server!",
                iconURL: member.user.displayAvatarURL(),
            })],
        })
    } catch (e) {
        console.log(e)
    }
    

}