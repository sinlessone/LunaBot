const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { exists, execute, queryone, db } = require('../../utils/db');
const { presets } = require('../../data/embed');
const { wait } = require('../../utils/wait');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Try your luck at the slots!')
        .addNumberOption(option => option
            .setName('amount')
            .setDescription('Amount of coins to bet')
            .setRequired(true)
        ),
    cooldown: 5,
    async execute(interaction) {
        const amount = interaction.options.getNumber('amount');
        const user = interaction.user;
        const userexists = await exists(db, user.id);

        if (!userexists) {
            return interaction.reply({
                embeds: [
                    presets.error('❌ Registration Required', 'You are not registered. Use **/register** to get started.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        const { balance } = await queryone(db, 'SELECT balance FROM users WHERE user_id=?', [user.id]);
        if (amount > balance) {
            return interaction.reply({
                embeds: [
                    presets.warning('Insufficient Funds', "You don't have enough money to bet that amount!")
                ]
            });
        }

        const emojis = ['🍎', '🍎', '🍎', '🍎', '🍪', '🍪', '🍪', '🍒', '🍒', '🏅', '🎰'];
        const x3multipliers = {
            '🍎': 3,
            '🍪': 5,
            '🍒': 10,
            '🏅': 50,
            '🎰': 300
        };
        const x2multipliers = {
            '🍎': 0.2,
            '🍪': 0.5,
            '🍒': 1,
            '🏅': 2,
            '🎰': 5
        };

        const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot3 = emojis[Math.floor(Math.random() * emojis.length)];
        let winnings = 0;

        if (slot1 === slot2 && slot2 === slot3) {
            winnings = amount * x3multipliers[slot1];
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            const matchingEmoji = slot1 === slot2 ? slot1 : (slot2 === slot3 ? slot2 : slot1);
            winnings = amount * x2multipliers[matchingEmoji];
        } else {
            winnings = 0;
        }

        await execute(db, 'UPDATE users SET balance=balance+? WHERE user_id=?', [winnings - amount, user.id]);

        await interaction.reply({
            embeds: [
                presets.info(
                    '🎰 Slots 🎰',
                    '<a:slots:1492164855120003163> | <a:slots:1492164855120003163> | <a:slots:1492164855120003163>\nSpinning the reels...'
                )
            ]
        }).then(async () => {
            await wait(1500);

            if (winnings > 0) {
                if (slot1 === slot2 && slot2 === slot3) {
                    await interaction.editReply({
                        embeds: [
                            presets.success(
                                '🎰 JACKPOT! 🎰',
                                `**${slot1} | ${slot2} | ${slot3}**\n\n🎉 You won **${winnings} coins**!\nThat's a **${x3multipliers[slot1]}x multiplier**!`
                            )
                        ]
                    });
                } else {
                    await interaction.editReply({
                        embeds: [
                            presets.success(
                                '🎰 Win! 🎰',
                                `**${slot1} | ${slot2} | ${slot3}**\n\n🎉 You won **${winnings} coins**!`
                            )
                        ]
                    });
                }
            } else {
                await interaction.editReply({
                    embeds: [
                        presets.warning(
                            '🎰 Loss! 🎰',
                            `**${slot1} | ${slot2} | ${slot3}**\n\n💔 You lost **${amount} coins**! Better luck next time!`
                        )
                    ]
                });
            }
        });
    }
};
