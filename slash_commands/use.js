const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Item = require('../models/items.js');
const Inventory = require('../models/inventory.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('use')
        .setDescription('Usa un objeto de tu inventario.')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('El nombre del objeto que deseas usar.')
                .setRequired(true)),

    async execute(interaction) {
        const discordId = interaction.user.id;
        const guildId = interaction.guild.id; 
        const itemName = interaction.options.getString('nombre');

        try {
            const item = await Item.findOne({ name: itemName, guildId: guildId });
            if (!item) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Objeto no encontrado')
                    .setDescription(`El objeto **${itemName}** no pertenece a la tienda de este servidor.`)
                    .setColor('#D9534F');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const inventory = await Inventory.findOne({ userId: discordId, guildId: guildId });
            if (!inventory) {
                const noInventoryEmbed = new EmbedBuilder()
                    .setTitle('❌ Inventario vacío')
                    .setDescription(`No tienes ningún objeto en tu inventario para este servidor.`)
                    .setColor('#D9534F');
                return interaction.reply({ embeds: [noInventoryEmbed], ephemeral: true });
            }

            const inventoryItem = inventory.items.find(i => i.itemId.toString() === item._id.toString());
            if (!inventoryItem || inventoryItem.quantity <= 0) {
                const noItemEmbed = new EmbedBuilder()
                    .setTitle('❌ Objeto no disponible')
                    .setDescription(`No tienes el objeto **${itemName}** en tu inventario.`)
                    .setColor('#D9534F');
                return interaction.reply({ embeds: [noItemEmbed], ephemeral: true });
            }

            if (item.role) {
                const role = interaction.guild.roles.cache.get(item.role) || interaction.guild.roles.cache.find(r => r.name === item.role);
                if (!role) {
                    const noRoleEmbed = new EmbedBuilder()
                        .setTitle('❌ Rol no encontrado')
                        .setDescription(`El rol asociado al objeto **${itemName}** no existe en este servidor.`)
                        .setColor('#D9534F');
                    return interaction.reply({ embeds: [noRoleEmbed], ephemeral: true });
                }

                const member = interaction.guild.members.cache.get(discordId);
                await member.roles.add(role.id);

                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Objeto usado')
                    .setDescription(`Has usado el objeto **${itemName}** y se te ha asignado el rol ${"<@&" + role.id + ">"}.`)
                    .setColor('#26ed2c');

                inventoryItem.quantity -= 1;
                inventory.items = inventory.items.filter(i => i.quantity > 0); 
                await inventory.save();

                return interaction.reply({ embeds: [successEmbed] });
            }

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Objeto usado')
                .setDescription(`Has usado el objeto **${itemName}** y ha desaparecido de tu inventario.`)
                .setColor('#26ed2c');

            inventoryItem.quantity -= 1;
            inventory.items = inventory.items.filter(i => i.quantity > 0); 
            await inventory.save();

            return interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error en el comando /use:', error);

            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo más tarde.')
                .setColor('#D9534F');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
