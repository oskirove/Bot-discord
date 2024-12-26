const Discord = require('discord.js');
const User = require('../models/users.js');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu balance de monedas.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que quieres ver el balance.')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const guildId = interaction.guild.id;
        const discordId = targetUser.id;
        const username = targetUser.username;

        let user = await User.findOne({ discordId, guildId });
        if (!user) {
            user = await User.create({ discordId, guildId, username });
        }

        const totalMoney = (user.cash || 0) + (user.bank || 0);

        const Embed = new Discord.EmbedBuilder()
            .setAuthor({ name: "ABANCA", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images" })
            .setTitle('Cuenta bancaria')
            .setDescription(`Aquí puedes ver el estado de la cuenta bancaria y los fondos disponibles de <@${targetUser.id}>`)
            .setImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fselectra.es%2Fsites%2Fselectra.es%2Ffiles%2Fstyles%2Farticle_hero%2Fpublic%2Fimages%2Fabanca-online-825x293_0.png%3Fitok%3DWBQpEcQe&f=1&nofb=1&ipt=e681e297b40a06942dcdb89e6f00b8831ce585900dbbe23da0a97c03a88d0bc1&ipo=images")
            .addFields(
                { name: '💵 Efectivo:', value: user.cash.toString() + ' 🪙', inline: true },
                { name: '💳 Cuenta: ', value: user.bank.toString() + ' 🪙', inline: true },
                { name: '🏦 Total: ', value: totalMoney + ' 🪙', inline: true },
            )
            .setColor('#76a4f0');

        await interaction.reply({ embeds: [Embed] });
    },
};
