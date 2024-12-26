const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Retira una cantidad de dinero del banco para usarlo en efectivo.')
        .addIntegerOption(option =>
            option
                .setName('cantidad')
                .setDescription('Cantidad de dinero que deseas retirar.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const discordId = interaction.user.id; 
        const guildId = interaction.guild.id; 
        const amount = interaction.options.getInteger('cantidad'); 

        if (amount <= 0) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('Debes ingresar una cantidad válida mayor a 0.')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        let user = await User.findOne({ discordId, guildId });

        if (!user) {
            user = new User({
                discordId,
                guildId,
                username: interaction.user.username, 
            });
        }

        if ((user.bank || 0) < amount) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('No tienes suficiente dinero en el banco para retirar esa cantidad.')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        user.bank -= amount;
        user.cash = (user.cash || 0) + amount;
        await user.save();

        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: "ABANCA", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images" })
            .setTitle('Retiro realizado')
            .setDescription(`Has retirado ${amount} 🪙 de tu banco. Ahora están en efectivo.`)
            .setColor('#76a4f0')
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [successEmbed] });
    },
};
