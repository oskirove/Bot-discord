const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');

const cooldowns = new Map(); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Roba dinero en efectivo de otro usuario.')
        .addUserOption(option =>
            option.setName('objetivo')
                .setDescription('El usuario al que deseas robar')
                .setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const thiefId = interaction.user.id;
        const targetUser = interaction.options.getUser('objetivo');
        const cooldownKey = `${guildId}-${thiefId}`;

        if (targetUser.id === thiefId) {
            return interaction.reply({
                content: '❌ No puedes robarte a ti mismo.',
                ephemeral: true,
            });
        }

        const now = Date.now();
        if (cooldowns.has(cooldownKey) && now - cooldowns.get(cooldownKey) < 30 * 60 * 1000) {
            const remaining = Math.ceil((30 * 60 * 1000 - (now - cooldowns.get(cooldownKey))) / 1000 / 60);
            return interaction.reply({
                content: `⏳ Debes esperar ${remaining} minutos antes de volver a robar.`,
                ephemeral: true,
            });
        }

        const thief = await User.findOne({ discordId: thiefId, guildId });
        const target = await User.findOne({ discordId: targetUser.id, guildId });

        if (!thief || !target || (target.cash || 0) <= 0) {
            return interaction.reply({
                content: '❌ El usuario objetivo no tiene dinero en efectivo para robar.',
                ephemeral: true,
            });
        }

        const catchChance = 0.3; 
        if (Math.random() < catchChance) {
            const fineAmount = 3000;
            thief.cash = (thief.cash || 0) - fineAmount;
            thief.reputation -= 5;
            await thief.save();

            const caughtEmbed = new EmbedBuilder()
                .setAuthor({ name: "CNP", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F521706542995742722%2FgwBvfW77.jpeg&f=1&nofb=1&ipt=6fb8604ada1b5a4e26ec79cb768a408454e0f8261aab4e6e8949c137fb7b740b&ipo=images"})
                .setTitle('🚨 ¡Te atraparon!')
                .setDescription(`La policía te atrapó intentando robar a <@${targetUser.id}>. Has sido multado con ${fineAmount} 🪙.`)
                .setColor('#FF0000')
                .setFooter({ text: 'No todos los crímenes salen bien.' });

            cooldowns.set(cooldownKey, now);
            return interaction.reply({ embeds: [caughtEmbed] });
        }

        const maxRobAmount = target.cash;
        const minRobAmount = Math.ceil(maxRobAmount / 2);
        const robAmount = Math.floor(Math.random() * (maxRobAmount - minRobAmount + 1)) + minRobAmount;

        target.cash -= robAmount;
        thief.cash = (thief.cash || 0) + robAmount;
        await target.save();
        await thief.save();

        cooldowns.set(cooldownKey, now);

        const successEmbed = new EmbedBuilder()
            .setTitle('🕵️‍♂️ Robo exitoso')
            .setDescription(`Has robado ${robAmount} 🪙 de <@${targetUser.id}>.`)
            .setColor('#FFD700')
            .setFooter({ text: 'El crimen paga... a veces.' });

        return interaction.reply({ embeds: [successEmbed] });
    },
};
