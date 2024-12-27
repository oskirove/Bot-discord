const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('Bot activo!');
});

app.listen(port, () => {
  console.log(`App escuchando en http://localhost:${port}`);
});


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

fs.readdirSync("./slash_commands").forEach((commandfile) => {
    const command = require(`./slash_commands/${commandfile}`);
    client.commands.set(command.data.name, command);
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Conexión a MongoDB establecida con éxito.");
}).catch((error) => {
    console.log("Error al conectar a MongoDB:");
    console.log(error);
});

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: client.commands.map((cmd) => cmd.data.toJSON()) }
        );        

        if (client.commands.size === 1) {
            console.log(`Cargado ${client.commands.size} comando de barra diagonal {/}`);
        } else {
            console.log(`Cargados ${client.commands.size} comandos de barra diagonal {/}`);
        }
    } catch (error) {
        console.error("Error al cargar los comandos de barra diagonal", error);
    }
})();

client.once('ready', () => {
    console.log(`Conectado como ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
    }
});

setInterval(() => {
  http.get(`http://localhost:${port}`);
}, 280000);

client.login(process.env.DISCORD_TOKEN);
