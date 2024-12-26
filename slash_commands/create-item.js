const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Item = require('../models/items.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-item')
        .setDescription('Crea un nuevo objeto para la tienda. (Solo administradores)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Solo administradores
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del objeto.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('icono')
                .setDescription('Emoji o icono del objeto.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('descripcion')
                .setDescription('Descripción del objeto.')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('precio')
                .setDescription('Precio del objeto.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rol')
                .setDescription('Nombre o ID del rol.')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Permiso denegado')
                .setDescription('Solo los administradores pueden usar este comando.')
                .setColor('#D9534F');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const name = interaction.options.getString('nombre');
        const description = interaction.options.getString('descripcion');
        const price = interaction.options.getNumber('precio');
        const role = interaction.options.getString('rol') || 'N/A';
        const icon = interaction.options.getString('icono');

        cleanedRoleId = role.replace(/<@&|>/g, '');

        const existingItem = await Item.findOne({ name, guildId });
        if (existingItem) {
            const duplicateEmbed = new EmbedBuilder()
                .setTitle('❌ Objeto duplicado')
                .setDescription(`Ya existe un objeto con el nombre **${name}**. Por favor, elige otro nombre.`)
                .setColor('#D9534F');

            return interaction.reply({ embeds: [duplicateEmbed], ephemeral: true });
        }

        try {
            const item = new Item({
                guildId,
                name,
                description,
                price,
                role: cleanedRoleId !== 'N/A' ? cleanedRoleId : null,
                icon,
            });

            await item.save();

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Objeto creado exitosamente')
                .setDescription(`Un nuevo objeto ha sido añadido a la tienda.`)
                .addFields(
                    { name: 'Nombre', value: name, inline: true },
                    { name: 'Descripción', value: description, inline: false },
                    { name: 'Precio', value: `${price} 🪙`, inline: true },
                    { name: 'Rol', value: role || 'Ninguno', inline: true },
                    { name: 'Icono', value: icon, inline: true },
                )
                .setColor('#26ed2c');

            return interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error al guardar el objeto:', error);

            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error al guardar el objeto')
                .setDescription('Ocurrió un error al intentar crear el objeto. Por favor, inténtalo de nuevo más tarde.')
                .setColor('#D9534F');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
