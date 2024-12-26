const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Obtén tu recompensa diaria de monedas.'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const guildId = interaction.guild.id;  
        const username = interaction.user.username; 

        let user = await User.findOne({ discordId, guildId });

        if (!user) {
            user = await User.create({ discordId, guildId, username });
        }

        const now = Date.now();
        const nextClaim = user.lastDaily ? new Date(user.lastDaily).getTime() + ms('24h') : 0;

        if (now < nextClaim) {
            const timeLeft = ms(nextClaim - now, { long: true });
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Agencia tributaria", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flogosandtypes.com%2Fwp-content%2Fuploads%2F2020%2F06%2Fagencia-tributaria.png&f=1&nofb=1&ipt=b0437ac9f1aab3a75f73dc0a83f5eb1e9364740349b63b3700a0a225ef502a40&ipo=images" })
                .setTitle('⏳ Recompensa diaria')
                .setDescription(`Ya has reclamado tu recompensa diaria. Vuelve en ${timeLeft}.`)
                .setColor('#ffffff')
                .setTimestamp()
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });    
            return interaction.reply({ embeds: [embed] });
        }

        const reward = 1000;
        user.cash = (user.cash || 0) + reward;
        user.lastDaily = now;
        await user.save();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Agencia tributaria", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flogosandtypes.com%2Fwp-content%2Fuploads%2F2020%2F06%2Fagencia-tributaria.png&f=1&nofb=1&ipt=b0437ac9f1aab3a75f73dc0a83f5eb1e9364740349b63b3700a0a225ef502a40&ipo=images" })
            .setTitle('🎉 Recompensa diaria')
            .setDescription(`¡Has reclamado tu recompensa diaria de ${reward} 🪙!`)
            .setColor('#ffffff')
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [embed] });
    },
};
