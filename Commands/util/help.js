const { SlashCommandBuilder, EmbedBuilder, resolveColor, MessageFlags} = require('discord.js');
const config = require('../../config.json')
const {presets} = require("../../data/embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription("Get help about this bot's commands")
        .addStringOption(option => option
            .setName("category")
            .setDescription("The category to get help for")
            .setRequired(false)
            .addChoices(
                {
                    name: "Fun",
                    value: "fun"
                },
                {
                    name: "Economy",
                    value: "economy"
                },
                {
                    name: "Moderation",
                    value: "moderation"
                },
                {
                    name: "Community",
                    value: "community"
                },
                {
                    name: "Utility",
                    value: "utility"
                },
                {
                    name: "Main",
                    value: "main"
                }
            )
        ),

    async execute(interaction) {
        const option = interaction.options.getString("category") || "main"
        const embed = new EmbedBuilder()
            .setFooter({ text: config.footer, iconURL: config.footerUrl })
            .setTimestamp(new Date())

        if (option === "main") {
            return await interaction.reply({
                embeds: [embed.setColor(resolveColor("Blue"))
                    .setTitle("🤖 LunaBot Commands")
                    .setDescription("Get started with LunaBot!  Use `/help [category]` to learn more about each category.")
                    .addFields(
                        {
                            name: "📚 Fun Commands",
                            value: "`/beg` `/rob` `/trade` `/gamble` `/bless` `/register` `/setupcounting` `/setcountingnumber`"
                        },
                        {
                            name: "💰 Economy Commands",
                            value: "`/list` `/unlist`"
                        },
                        {
                            name: "🛡️ Moderation Commands",
                            value: "`/ban` `/kick` `/unban` `/timeout` `/inviter`"
                        },
                        {
                            name: "👥 Community Commands",
                            value: "`/addqotd` `/sendqotd`"
                        },
                        {
                            name: "🔧 Utility Commands",
                            value: "`/server` `/lookup` `/status`"
                        }
                    )
                ]
            })
        }

        if (option === "fun") {
            return await interaction.reply({
                embeds: [embed.setColor(resolveColor("Gold"))
                    .setTitle("🎮 Fun Commands")
                    .addFields(
                        {
                            name: "/beg",
                            value:  "Use the goodness of people to fuel your addictions! (30s cooldown)"
                        },
                        {
                            name: "/rob <user>",
                            value: "Take a shot at someone's wealth! (10s cooldown, requires 300+ balance)"
                        },
                        {
                            name: "/trade <user> <amount>",
                            value: "Trade your money with someone!  (10s cooldown)"
                        },
                        {
                            name: "/gamble <amount>",
                            value: "Take a chance with the devil! 1/3 chance to win 2x your bet (3s cooldown)"
                        },
                        {
                            name: "/bless <amount> [user]",
                            value: "Bless someone with money (Owner only)"
                        },
                        {
                            name: "/register",
                            value: "Register and become a member of the economy! (120s cooldown, Start with 3000$)"
                        },
                        {
                            name: "/setupcounting <channel>",
                            value: "Sets a channel for counting (Admin only)"
                        },
                        {
                            name: "/setcountingnumber <number>",
                            value: "Sets the current counting number (Admin only)"
                        }
                    )
                ]
            })
        }

        if (option === "economy") {
            return await interaction.reply({
                embeds: [embed.setColor(resolveColor("Green"))
                    .setTitle("💰 Economy Commands")
                    .addFields(
                        {
                            name: "/list <name> <price> <channel> [note]",
                            value: "List an account in the server (Owner only)"
                        },
                        {
                            name: "/unlist <id>",
                            value: "Removes an account from your server and database (Owner only)"
                        }
                    )
                ]
            })
        }

        if (option === "moderation") {
            return await interaction.reply({
                embeds: [embed. setColor(resolveColor("Red"))
                    .setTitle("🛡️ Moderation Commands")
                    .addFields(
                        {
                            name: "/ban <user> [reason] [duration]",
                            value: "Bans a member from this guild (Requires Ban Members permission)"
                        },
                        {
                            name: "/kick <user> [reason]",
                            value: "Kicks a member from this guild (Requires Kick Members permission)"
                        },
                        {
                            name: "/unban <user> [reason]",
                            value: "Unbans a banned member from the server (Requires Ban Members permission)"
                        },
                        {
                            name: "/timeout <user> <duration> [reason]",
                            value: "Timeout a member (duration in hours, max 672 hours)"
                        },
                        {
                            name:  "/inviter <user>",
                            value:  "See who invited a user (Moderator only)"
                        }
                    )
                ]
            })
        }

        if (option === "community") {
            return await interaction.reply({
                embeds: [embed.setColor(resolveColor("Purple"))
                    .setTitle("👥 Community Commands")
                    . addFields(
                        {
                            name: "/addqotd <question>",
                            value: "Add a new QOTD (Question of the Day) (Admin only)"
                        },
                        {
                            name: "/sendqotd",
                            value: "Send a random QOTD to the channel"
                        }
                    )
                ]
            })
        }

        if (option === "utility") {
            return await interaction.reply({
                embeds: [embed.setColor(resolveColor("Blue"))
                    .setTitle("🔧 Utility Commands")
                    .addFields(
                        {
                            name:  "/server",
                            value:  "Returns information about this server (channels, members, roles, creation date)"
                        },
                        {
                            name: "/lookup [user]",
                            value: "Get info about a user (profile creation date, roles, join date, etc.)"
                        },
                        {
                            name: "/status <text> [state]",
                            value: "Set the bot's status (Owner only). States: online, dnd, idle, invisible"
                        }
                    )
                ]
            })
        }
    }
}