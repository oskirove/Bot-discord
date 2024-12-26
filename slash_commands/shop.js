const Discord = require('discord.js');
const Item = require('../models/items.js');
const User = require('../models/users.js');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra los objetos disponibles en la tienda.'),
    async execute(interaction) {
        const guildId = interaction.guild.id

        const items = await Item.find({guildId: guildId});

        if (items.length === 0) {
            return interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Mercadona', iconURL: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.ggpht.com%2Fa-%2FAAuE7mDSpDyb3S_enrYyX8xYWgjVHN_5dnh9Skia_Q%3Ds900-mo-c-c0xffffffff-rj-k-no&f=1&nofb=1&ipt=d4c120eb136ef51a92ebdae0ab5ccdc5ad9b0c720b8508de40400afe0a086149&ipo=images' })
                        .setTitle('¡Oh no! La tienda está vacía.')
                        .setDescription('¡Pronto traeremos nuevos artículos! No te preocupes.')
                        .setColor('#1E6F1E')
                        .setFooter({ text: 'Mercadona | La tienda que nunca cierra' })
                ]
            });
        }

        const embed = new Discord.EmbedBuilder()
            .setAuthor({ name: 'Mercadona', iconURL: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.ggpht.com%2Fa-%2FAAuE7mDSpDyb3S_enrYyX8xYWgjVHN_5dnh9Skia_Q%3Ds900-mo-c-c0xffffffff-rj-k-no&f=1&nofb=1&ipt=d4c120eb136ef51a92ebdae0ab5ccdc5ad9b0c720b8508de40400afe0a086149&ipo=images' })
            .setTitle('🎁 Articulos disponibles 🎁')
            .setDescription('Aquí tienes una selección de artículos únicos que puedes comprar para realizar esta acción puedes usar el comando `/buy [nombre-articulo]`.')
            .setColor('#1E6F1E')
            .setFooter({ text: 'Mercadona | Siempre cerca de ti' });

        items.forEach(item => {
            const fullRoleId = '<@&' + item.role + '>';

            embed.addFields({
                name: `${item.price} 🪙 - ${item.icon} ${item.name} `,
                value: `> **Descripción:** ${item.description}\n > **Rol:** ${fullRoleId}`,
            });
        });

        await interaction.reply({ embeds: [embed] });
    },
};
