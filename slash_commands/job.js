const { SlashCommandBuilder, EmbedBuilder, Client } = require('discord.js');
const User = require('../models/users.js');

const jobs = {
    politico: { type: 'legal', salary: 4000, reputation: 10 },
    policia: { type: 'legal', salary: 1500, reputation: 20 },
    frutero: { type: 'legal', salary: 1000, reputation: 5 },
    camello: { type: 'ilegal', salary: 2000, reputation: -20 },
    hacker: { type: 'ilegal', salary: 1800, reputation: -15 },
    taxista: { type: 'legal', salary: 1000, reputation: 5 },
    ladrón: { type: 'ilegal', salary: 1500, reputation: -10 },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('job')
        .setDescription('Elige un trabajo.')
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('El trabajo que quieres realizar.')
                .setRequired(true)
                .addChoices(
                    ...Object.keys(jobs).map(job => ({ name: job, value: job }))
                )
        ),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const guildId = interaction.guild.id;
        const jobName = interaction.options.getString('nombre');

        const job = jobs[jobName];
        if (!job) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('Ese trabajo no existe.')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [errorEmbed] });
        }

        let user = await User.findOne({ discordId, guildId });
        if (!user) {
            user = await User.create({ discordId, guildId, username: interaction.user.username });
        }

        if (user.job === jobName) {
            const sameJobEmbed = new EmbedBuilder()
                .setTitle('🔔 Aviso')
                .setDescription(`Ya tienes el trabajo de ${jobName}.`)
                .setColor('#FFFF00');
            return interaction.reply({ embeds: [sameJobEmbed] });
        }

        const changeFee = 1000;
        if (user.cash < changeFee) {
            const feeEmbed = new EmbedBuilder()
                .setAuthor({ name: "SEPE", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fthumbs.dreamstime.com%2Fb%2Fbandera-de-la-forma-redonda-espa%25C3%25B1a-101199592.jpg&f=1&nofb=1&ipt=4e4d1812d67afb0edf56089e7433f2416ba4188fbaaf2b2bbe7d055006544453&ipo=images" })
                .setTitle('❌ Error')
                .setDescription(`Necesitas al menos ${changeFee} 🪙 para cambiar de trabajo.`)
                .setColor('#FF0000');
            return interaction.reply({ embeds: [feeEmbed] });
        }

        user.cash -= changeFee;
        user.job = jobName;
        user.reputation += job.reputation;
        await user.save();

        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: "SEPE", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fthumbs.dreamstime.com%2Fb%2Fbandera-de-la-forma-redonda-espa%25C3%25B1a-101199592.jpg&f=1&nofb=1&ipt=4e4d1812d67afb0edf56089e7433f2416ba4188fbaaf2b2bbe7d055006544453&ipo=images" })
            .setTitle('Nuevo Trabajo')
            .setDescription(`Ahora trabajas como **${jobName}**. Ten cuidado, cada trabajo tiene sus ventajas y desventajas.`)
            .addFields(
                { name: 'Salario:', value: `${job.salary} 🪙`, inline: true },
                { name: 'Reputación:', value: `${job.reputation > 0 ? '+' : ''}${job.reputation} 🌟`, inline: true }
            )
            .setImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsepecursosgratis.es%2Fwp-content%2Fuploads%2F2022%2F12%2FCursos-gratis-del-SEPE-1024x576-1.jpg&f=1&nofb=1&ipt=cc1a3f33d378ad8e1114830cf81a3b9d700ab41596e35d9a7a63af2097ad11fd&ipo=images")
            .setColor('#FFFF00')
            .setFooter({ text: 'Usa /work para ganar dinero.',});

        await interaction.reply({ embeds: [successEmbed] });
    },
};
