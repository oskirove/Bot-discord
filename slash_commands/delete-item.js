const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Item = require('../models/items.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-item')
        .setDescription('Elimina un objeto de la tienda. (Solo administradores)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) 
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del objeto que deseas eliminar.')
                .setRequired(true)),

    async execute(interaction) {
        const itemName = interaction.options.getString('nombre');
        const guildId = interaction.guild.id;

        try {
            const deletedItem = await Item.findOneAndDelete({ name: itemName, guildId });

            if (!deletedItem) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Error')
                            .setDescription(`El objeto con el nombre **${itemName}** no existe en la tienda.`)
                            .setColor('#FF0000')
                            .setFooter({ text: 'Sistema de Tienda' })
                    ],
                    ephemeral: true,
                });
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🗑️ ¡Objeto eliminado!')
                        .setDescription(`El objeto **${itemName}** ha sido eliminado de la tienda con éxito.`)
                        .setColor('#1E6F1E') 
                        .setFooter({ text: 'Sistema de Tienda' })
                ],
                ephemeral: false,
            });
        } catch (error) {
            console.error('Error al eliminar el objeto:', error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Ocurrió un error al intentar eliminar el objeto. Por favor, inténtalo más tarde.')
                        .setColor('#FF0000')
                        .setFooter({ text: 'Sistema de Tienda' })
                ],
                ephemeral: true,
            });
        }
    },
};
