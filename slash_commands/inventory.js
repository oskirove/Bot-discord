const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Inventory = require('../models/inventory.js');
const Item = require('../models/items.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Muestra los objetos de tu inventario.'),

    async execute(interaction) {
        const discordId = interaction.user.id;
        const guildId = interaction.guild.id;

        try {
            const inventory = await Inventory.findOne({ userId: discordId, guildId }).populate('items.itemId');
            if (!inventory || inventory.items.length === 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('📦 Inventario vacío')
                            .setDescription('Aún no tienes ningún objeto en tu inventario. ¡Compra algo en la tienda para empezar!')
                            .setColor('#FFA500')
                            .setFooter({ text: 'Sistema de Inventario' }),
                    ],
                    ephemeral: true,
                });
            }

            const totalItems = inventory.items.reduce((sum, item) => sum + item.quantity, 0);

            const embed = new EmbedBuilder()
                .setTitle('🎒 Tu Inventario')
                .setDescription(`Tienes un total de **${totalItems}** objetos.`)
                .setColor('#1E6F1E')
                .setFooter({ text: 'Sistema de Inventario' });

            inventory.items.forEach(({ itemId, quantity }) => {
                embed.addFields({
                    name: `${itemId.icon} ${itemId.name} (x${quantity})`,
                    value: `📝 **Descripción**: ${itemId.description}\n📜 **Rol**: ${"<@&" + itemId.role + ">"|| 'Ninguno'}`,
                    inline: false,
                });
            });

            return interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error al mostrar el inventario:', error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Ocurrió un error al intentar mostrar tu inventario. Por favor, inténtalo más tarde.')
                        .setColor('#FF0000') 
                        .setFooter({ text: 'Sistema de Inventario' }),
                ],
                ephemeral: true,
            });
        }
    },
};
