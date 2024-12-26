const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Muestra la información del perfil de un usuario.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario del que quieres ver el perfil.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const discordId = targetUser.id;
        const guildId = interaction.guild.id;

        let user = await User.findOne({ discordId, guildId });
        if (!user) {
            if (targetUser.id === interaction.user.id) {
                user = await User.create({ discordId, username: targetUser.username });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription(`No se encontró información sobre el usuario ${targetUser.username}.`)
                    .setColor('#FF0000');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }

        const totalMoney = (user.cash || 0) + (user.bank || 0);

        const profileEmbed = new EmbedBuilder()
            .setAuthor({ name: "CNP", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F521706542995742722%2FgwBvfW77.jpeg&f=1&nofb=1&ipt=6fb8604ada1b5a4e26ec79cb768a408454e0f8261aab4e6e8949c137fb7b740b&ipo=images"})
            .setTitle(`Perfil de ${user.username}`)
            .setColor('#162669')
            .addFields(
                { name: '👤 Nombre:', value: "<@" + discordId + ">", inline: true  },
                { name: '🪪 DNI:', value: discordId, inline: true },
                { name: '💼 Trabajo:', value: user.job || 'Sin trabajo', inline: false },
                { name: '🌟 Reputación:', value: `${user.reputation || 0}` + "", inline: false },
                { name: '🪙 Dinero:', value: `${totalMoney}`, inline: false }
            )
            .setFooter({ text: 'Usa comandos como /job para cambiar tu trabajo.' });

        await interaction.reply({ embeds: [profileEmbed] });
    },
};
