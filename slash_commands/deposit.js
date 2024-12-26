const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposita una cantidad específica de dinero en tu banco.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('La cantidad de dinero a depositar')
                .setRequired(true)
                .setMinValue(1)),
    async execute(interaction) {
        const discordId = interaction.user.id; 
        const guildId = interaction.guild.id;  
        const depositAmount = interaction.options.getInteger('cantidad'); 

        let user = await User.findOne({ discordId, guildId });

        if (!user) {
            user = new User({
                discordId,
                guildId,
                username: interaction.user.username,
            });
        }

        if ((user.cash || 0) < depositAmount) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription(`No tienes suficiente dinero en efectivo para depositar. Tienes ${(user.cash || 0)} 🪙.`)
                .setColor('#FF0000');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        user.bank = (user.bank || 0) + depositAmount;
        user.cash -= depositAmount;
        await user.save();

        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: "ABANCA", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images" })
            .setTitle('Depósito realizado')
            .setDescription(`Has depositado ${depositAmount} 🪙 en tu cuenta bancaria.`)
            .setColor('#76a4f0')
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [successEmbed] });
    },
};
