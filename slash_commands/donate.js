const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Dona dinero a otro usuario o a una causa benéfica y recupera tu reputación')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de dinero que deseas donar.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que deseas donar dinero.')
                .setRequired(false)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const donorId = interaction.user.id;
        const targetUser = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');

        if (amount <= 0) {
            return interaction.reply({
                content: '❌ La cantidad a donar debe ser mayor a 0.',
                ephemeral: true,
            });
        }

        try {
            let donor = await User.findOne({ discordId: donorId, guildId });
            if (!donor) {
                donor = new User({ discordId: donorId, guildId, cash: 0, reputation: 0 });
            }

            if (donor.cash < amount) {
                return interaction.reply({
                    content: '❌ No tienes suficiente dinero en efectivo para realizar esta donación.',
                    ephemeral: true,
                });
            }

            if (targetUser) {
                if (targetUser.id === donorId) {
                    return interaction.reply({
                        content: '❌ No puedes donarte dinero a ti mismo.',
                        ephemeral: true,
                    });
                }

                let recipient = await User.findOne({ discordId: targetUser.id, guildId });
                if (!recipient) {
                    recipient = new User({ discordId: targetUser.id, guildId, cash: 0, reputation: 0 });
                }

                donor.cash -= amount;
                recipient.cash += amount;
                donor.reputation += Math.ceil(amount / 2000);

                await donor.save();
                await recipient.save();

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: "ABANCA", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images" })
                    .setTitle('🤝 Donación Exitosa')
                    .setDescription(`Has donado ${amount} 🪙 a <@${targetUser.id}>. Gracias por tu generosidad.`)
                    .setColor('#76a4f0')
                    .addFields(
                        { name: 'Nueva reputación:', value: `${donor.reputation}`, inline: true },
                        { name: 'Dinero restante:', value: `${donor.cash} 🪙`, inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

                return interaction.reply({ embeds: [successEmbed] });
            }

            donor.cash -= amount;
            donor.reputation += Math.ceil(amount / 1500);

            await donor.save();

            const charityEmbed = new EmbedBuilder()
                .setAuthor({ name: "ABANCA", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images" })
                .setTitle('🌍 Donación a Causa Benéfica')
                .setDescription(`Has donado ${amount} 🪙 a una causa benéfica. Gracias por tu generosidad.`)
                .setColor('#76a4f0')
                .addFields(
                    { name: 'Nueva reputación:', value: `${donor.reputation}`, inline: true },
                    { name: 'Dinero restante:', value: `${donor.cash} 🪙`, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

            return interaction.reply({ embeds: [charityEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: '❌ Ocurrió un error al procesar tu donación. Por favor, inténtalo de nuevo más tarde.',
                ephemeral: true,
            });
        }
    },
};
