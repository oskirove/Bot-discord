const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Item = require('../models/items.js'); 
const Inventory = require('../models/inventory.js'); 
const User = require('../models/users.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra un objeto de la tienda específica del servidor.')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del objeto que deseas comprar.')
                .setRequired(true)),

    async execute(interaction) {
        const itemName = interaction.options.getString('nombre');
        const discordId = interaction.user.id;
        const guildId = interaction.guild.id; 

        try {
            const item = await Item.findOne({ name: itemName, guildId: guildId });
            if (!item) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: 'Mercadona', iconURL: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.ggpht.com%2Fa-%2FAAuE7mDSpDyb3S_enrYyX8xYWgjVHN_5dnh9Skia_Q%3Ds900-mo-c-c0xffffffff-rj-k-no&f=1&nofb=1&ipt=d4c120eb136ef51a92ebdae0ab5ccdc5ad9b0c720b8508de40400afe0a086149&ipo=images' })
                            .setTitle('❌ Error')
                            .setDescription(`El objeto **${itemName}** no esta disponible en nuestros almacenes.`)
                            .setColor('#FF0000') // Color rojo para errores
                            .setFooter({ text: 'Disculpa las molestias.' })
                    ],
                    ephemeral: true,
                });
            }

            const user = await User.findOne({ discordId: discordId });
            if (!user || user.cash < item.price) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: "ABANCA", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images" })
                            .setTitle('❌ Fondos insuficientes')
                            .setDescription(`No tienes suficiente dinero para comprar **${itemName}**. Precio: ${item.price} 🪙.`)
                            .setColor('#FF0000') // Color rojo para errores
                            .setFooter({ text: 'Tu banco de confianza' })
                    ],
                    ephemeral: true,
                });
            }

            user.cash -= item.price;
            await user.save();

            let inventory = await Inventory.findOne({ userId: discordId, guildId: guildId });
            if (!inventory) {
                inventory = new Inventory({ userId: discordId, guildId: guildId, items: [] });
            }

            const existingItemIndex = inventory.items.findIndex(i => i.itemId.equals(item._id));
            if (existingItemIndex > -1) {
                inventory.items[existingItemIndex].quantity += 1;
            } else {
                inventory.items.push({ itemId: item._id, quantity: 1 });
            }

            await inventory.save();

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'Mercadona', iconURL: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.ggpht.com%2Fa-%2FAAuE7mDSpDyb3S_enrYyX8xYWgjVHN_5dnh9Skia_Q%3Ds900-mo-c-c0xffffffff-rj-k-no&f=1&nofb=1&ipt=d4c120eb136ef51a92ebdae0ab5ccdc5ad9b0c720b8508de40400afe0a086149&ipo=images' })
                        .setTitle('🎉 ¡Compra exitosa!')
                        .setDescription(`Has comprado **${itemName}** por ${item.price} 🪙. ¡Disfruta tu nuevo objeto!`)
                        .setColor('#1E6F1E')
                        .setFooter({ text: 'Mercadona | Siempre cerca de ti' })
                    ],
                ephemeral: false,
            });
        } catch (error) {
            console.error('Error en el comando /buy:', error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'Mercadona', iconURL: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.ggpht.com%2Fa-%2FAAuE7mDSpDyb3S_enrYyX8xYWgjVHN_5dnh9Skia_Q%3Ds900-mo-c-c0xffffffff-rj-k-no&f=1&nofb=1&ipt=d4c120eb136ef51a92ebdae0ab5ccdc5ad9b0c720b8508de40400afe0a086149&ipo=images' })
                        .setTitle('❌ Error')
                        .setDescription('Ocurrió un error al procesar tu compra. Por favor, inténtalo más tarde.')
                        .setColor('#FF0000')
                        .setFooter({ text: 'Estamos trabajando duro para solucionar el problema' })
                ],
                ephemeral: true,
            });
        }
    },
};
