const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Envía monedas a otro usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que quieres enviar monedas.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('La cantidad de monedas a enviar.')
                .setRequired(true)),
    async execute(interaction) {
        const senderId = interaction.user.id;
        const recipient = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');
        const guildId = interaction.guild.id;

        if (amount <= 0) {
            return interaction.reply('❌ La cantidad debe ser mayor que 0.');
        }
        if (recipient.id === senderId) {
            return interaction.reply('❌ No puedes enviarte monedas a ti mismo.');
        }

        const member = await interaction.guild.members.fetch(recipient.id).catch(() => null);
        if (!member) {
            return interaction.reply('❌ El usuario no pertenece a este servidor.');
        }

        const sender = await User.findOne({ discordId: senderId, guildId });
        const receiver = await User.findOneAndUpdate(
            { discordId: recipient.id, guildId },
            { username: recipient.username, guildId },
            { upsert: true, new: true }
        );

        if (!sender || sender.cash < amount) {
            return interaction.reply('❌ No tienes suficientes monedas.');
        }

        sender.cash -= amount;
        receiver.cash += amount;

        await sender.save();
        await receiver.save();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "ABANCA", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images" })
            .setTitle('💸 Transferencia bancaria')
            .setDescription(`¡Has enviado con exito ${amount} 🪙 a <@${recipient.id}>!`)
            .addFields(
                { name: 'Remitente', value: "<@" + senderId + ">", inline: true },
                { name: 'Destinatario', value: "<@" + recipient.id + ">", inline: true },
                { name: 'Cantidad', value: amount.toString() + " 🪙", inline: true }
            )
            .setColor('#76a4f0')
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });


        await interaction.reply({ embeds: [embed] });
    },
};

