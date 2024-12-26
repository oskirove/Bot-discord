const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/users.js');

const cooldowns = new Map(); 
const randomMoney = Math.floor(Math.random() * 5000) + 2000
const randomReputation = Math.floor(Math.random() * 11) + 5

const events = {
    politico: [
        { chance: 0.1, outcome: `Te acusaron de corrupción y perdiste ${randomMoney} 🪙. Tu reputación ha disminuido.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.1, outcome: `Recibiste una bonificación por buen desempeño: +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.15, outcome: `Te contrataron como asesor en un ministerio inexistente. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Alguien descubrió tus sobres bajo la mesa. Perdiste ${randomMoney} 🪙 y tu reputación está bajo tierra.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.2, outcome: `Te uniste a la comisión de “estudio”. Nadie sabe qué estudias, pero cobras. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.05, outcome: `Fuiste expulsado del partido por no seguir la "línea oficial". Tu reputación aumenta, pero perdiste ${randomMoney} 🪙 en indemnizaciones.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.1, outcome: `Te acusaron de plagiar tu tesis. La reputación está en caída libre, aunque mantienes el cargo.`, effect: user => user.reputation -= randomReputation },
        { chance: 0.1, outcome: `Te regalaron un jamón en un acto público. Nadie sabe de dónde vino, pero tu reputación baja.`, effect: user => user.reputation -= randomReputation },
        { chance: 0.15, outcome: `Tu discurso viralizó en TikTok como meme. Tu reputación subió sin quererlo.`, effect: user => user.reputation += randomReputation },
        { chance: 0.15, outcome: `Intentaste inaugurar una rotonda que ya existía. Perdiste ${randomMoney} 🪙 en el proceso.`, effect: user => user.cash -= randomMoney },
        { chance: 0.1, outcome: `Te ofrecieron liderar un partido nuevo. Ganaste ${randomMoney} 🪙, pero nadie confía en ti.`, effect: user => user.cash += randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.1, outcome: `Fuiste tendencia en X por usar “WhatsApp” como ejemplo de innovación. Tu reputación sube entre boomers.`, effect: user => user.reputation += randomReputation },
    ],
    camello: [
        { chance: 0.3, outcome: `La policía te atrapó. Pagaste una multa de ${randomMoney}. Cuida tu reputación, está en picado.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.1, outcome: `Lograste vender un lote grande. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.2, outcome: `Tus clientes te dejaron una reseña en Yelp: “el mejor en el mercado negro”. +${randomMoney} 🪙 y tu reputación mejora.`, effect: user => user.cash += randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.05, outcome: `Te confiscaron todo en una redada sorpresa. Perdiste ${randomMoney} 🪙 y tu reputación cae al nivel del subsuelo.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.1, outcome: `Te confundieron con un repartidor de Glovo. Pasaste desapercibido y obtuviste una ganancia de +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.2, outcome: `Te robaron la merca. Perdiste ${randomMoney} 🪙.`, effect: user => user.cash -= randomMoney },
        { chance: 0.05, outcome: `Te confundieron con un influencer de fitness y duplicaste tus ventas. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.15, outcome: `Tu última entrega venía con un juguete de regalo. Subiste en popularidad.`, effect: user => user.reputation += randomReputation },
        { chance: 0.1, outcome: `Una colaboración con un rapero local resultó ser un éxito. +${randomMoney} 🪙 y tu reputación sube.`, effect: user => user.cash += randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.05, outcome: `Te delató un pájaro en tu azotea. Perdiste ${randomMoney} 🪙 en multas.`, effect: user => user.cash -= randomMoney },

    ],
    policia: [
        { chance: 0.25, outcome: `Confiscaste dinero de actividades ilegales. +${randomMoney} 🪙. Tu reputación está en ascenso.`, effect: user => user.cash += randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.1, outcome: `Te acusaron de abuso de poder. Perdiste ${randomMoney} 🪙 y tu reputación disminuye.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.2, outcome: `Te ofrecieron un sobresueldo por mirar hacia otro lado. +${randomMoney} 🪙, pero tu reputación sufre un poco.`, effect: user => user.cash += randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.1, outcome: `Te ascendieron por ser el único que terminó un informe. +${randomMoney} 🪙 y tu reputación sube.`, effect: user => user.cash += randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.05, outcome: `Te sorprendieron usando el coche oficial para ir de vacaciones. Tu reputación se desplomó, pero no perdiste dinero.`, effect: user => user.reputation -= randomReputation },
        { chance: 0.2, outcome: `Rescataste a un gato de un árbol. Tu reputación sube, pero no ganaste nada.`, effect: user => user.reputation += randomReputation },
        { chance: 0.1, outcome: `Fuiste viral en un TikTok haciendo un baile en servicio. Tu reputación subió.`, effect: user => user.reputation += randomReputation },
        { chance: 0.05, outcome: `Confiscaste galletas de contrabando en una escuela. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.15, outcome: `Arrestaste a un político por evasión fiscal. +${randomMoney} 🪙 y tu reputación sube entre los ciudadanos.`, effect: user => user.cash += randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.1, outcome: `Devolviste una cartera perdida. La persona te recompensó con +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
    ],
    taxista: [
        { chance: 0.2, outcome: `Tu cliente dejó una propina generosa. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.15, outcome: `Tu vehículo se quedó sin gasolina. Perdiste ${randomMoney} 🪙.`, effect: user => user.cash -= randomMoney },
        { chance: 0.1, outcome: `Llevaste a un político que olvidó su maletín lleno de efectivo. +${randomMoney} 🪙, pero no digas nada.`, effect: user => user.cash += randomMoney },
        { chance: 0.05, outcome: `Te acusaron de trabajar para Uber en secreto. Perdiste ${randomMoney} 🪙 y tu reputación disminuyó.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.2, outcome: `Una huelga masiva te dejó con pocos viajes. Perdiste ${randomMoney} 🪙.`, effect: user => user.cash -= randomMoney },
        { chance: 0.2, outcome: `Un cliente borracho olvidó su teléfono en el taxi. +${randomMoney} 🪙 en recompensa.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Una celebridad tomó tu taxi. Ganas +${randomMoney} 🪙 y tu reputación sube.`, effect: user => user.cash += randomMoney, effect: user => user.reputation += randomReputation },
        { chance: 0.05, outcome: `Te equivocaste de dirección y perdiste tiempo y ${randomMoney} 🪙 en combustible.`, effect: user => user.cash -= randomMoney },
        { chance: 0.15, outcome: `Un influencer te grabó mientras conducías. Tu reputación sube inesperadamente.`, effect: user => user.reputation += randomReputation },
        { chance: 0.1, outcome: `Tu taxi apareció en un videoclip de trap. Ganas +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
    ],
    ladrón: [
        { chance: 0.3, outcome: `Intentaste robar, pero fallaste y pagaste una multa de ${randomMoney} 🪙. Tu reputación ha disminuido.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.2, outcome: `Robaste con éxito. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Fuiste confundido con un político. La gente asumió que ya habías robado suficiente, pero obtuviste +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.05, outcome: `Te descubrieron, pero sobornaste al juez. Perdiste ${randomMoney} 🪙 y tu reputación cayó.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.15, outcome: `Lograste un atraco al banco central. +${randomMoney} 🪙, pero cuidado con la Interpol.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Intentaste robar un banco, pero era feriado. Perdiste ${randomMoney} 🪙 en el plan fallido.`, effect: user => user.cash -= randomMoney },
        { chance: 0.05, outcome: `Robaste una joya falsa pensando que era auténtica. Tu reputación baja por novato.`, effect: user => user.reputation -= randomReputation },
        { chance: 0.2, outcome: `Asaltaste una tienda y olvidaste las llaves del coche. +${randomMoney} 🪙 en efectivo.`, effect: user => user.cash += randomMoney },
    ],
    hacker: [
        { chance: 0.25, outcome: `Tu hackeo fue detectado y pagaste una multa de ${randomMoney} 🪙. Tu reputación está en descenso.`, effect: user => user.cash -= randomMoney, effect: user => user.reputation -= randomReputation },
        { chance: 0.15, outcome: `Lograste hackear una cuenta bancaria. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Hackeaste una página del gobierno y encontraron memes. Tu reputación subió, pero no ganaste dinero.`, effect: user => user.reputation += randomReputation },
        { chance: 0.05, outcome: `Te contrató un partido político para borrar "accidentalmente" ciertos archivos. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
        { chance: 0.2, outcome: `Intentaste hackear a Hacienda. Malas noticias: perdiste ${randomMoney} 🪙 y estás fichado.`, effect: user => user.cash -= randomMoney },
        { chance: 0.2, outcome: `Hackeaste la cuenta de tu ex y publicaste memes. Tu reputación sube, pero no ganaste dinero.`, effect: user => user.reputation += randomReputation },
        { chance: 0.1, outcome: `Interceptaste un paquete de Amazon con drones. +${randomMoney} 🪙 de valor.`, effect: user => user.cash += randomMoney },
        { chance: 0.05, outcome: `Tu hackeo dejó sin Internet a un barrio entero. Tu reputación bajó.`, effect: user => user.reputation -= randomReputation },
        { chance: 0.15, outcome: `Te contrató una empresa para "mejorar su seguridad". Cobraste y encontraste ${randomMoney} 🪙 en vulnerabilidades.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Hackeaste un casino online y ganaste legalmente. +${randomMoney} 🪙.`, effect: user => user.cash += randomMoney },
    ],
    frutero: [
        { chance: 0.1, outcome: `Subida inesperada del precio del aguacate. Tu clientela millennial ha disminuido y pierdes ${randomMoney} 🪙.`, effect: user => user.cash -= randomMoney },
        { chance: 0.1, outcome: `Te visitó un inspector de Hacienda por no declarar las bolsas de plástico. Perdiste ${randomMoney} 🪙 en multas.`, effect: user => user.cash -= randomMoney },
        { chance: 0.15, outcome: `Un cliente te pagó con billetes de Monopoly. Tu reputación se tambalea y pierdes ${randomMoney} 🪙 en la confusión.`, effect: user => user.cash -= randomMoney },
        { chance: 0.2, outcome: `Vendiste un melón por más del salario mínimo. +${randomMoney} 🪙 y orgullo frutero.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Tu cartel de “Prohibido tocar la fruta” se viralizó. Tu reputación sube entre fruteros conservadores.`, effect: user => user.reputation += randomReputation },
        { chance: 0.05, outcome: `Tu caja de fresas ecológicas fue confiscada por un activista vegano. Pierdes ${randomMoney} 🪙 y ganas un seguidor en Instagram.`, effect: user => { user.cash -= randomMoney; user.reputation += randomReputation; } },
        { chance: 0.1, outcome: `Tu oferta de "3 por 2" fue confundida con inflación encubierta. Tu reputación cae en picado.`, effect: user => user.reputation -= randomReputation },
        { chance: 0.15, outcome: `Un político local compró sandías para una foto electoral. Ganas ${randomMoney} 🪙 y un cartel publicitario gratis.`, effect: user => user.cash += randomMoney },
        { chance: 0.1, outcome: `Te acusaron de vender naranjas con formas sospechosas. Perdiste ${randomMoney} 🪙 en devoluciones.`, effect: user => user.cash -= randomMoney },
        { chance: 0.1, outcome: `Un influencer hizo un vídeo sobre tus peras. Subió tu reputación, pero no las ventas.`, effect: user => user.reputation += randomReputation },
        { chance: 0.2, outcome: `Un cliente te dejó propina por pesarle la fruta “sin truco”. +${randomMoney} 🪙 y satisfacción moral.`, effect: user => user.cash += randomMoney },
        { chance: 0.15, outcome: `Tu báscula fue recalibrada por la Junta de Madrid. Tus beneficios cayeron ${randomMoney} 🪙, pero ahora es legal.`, effect: user => user.cash -= randomMoney },
    ]
    
};

const randomEvent = (job, user) => {
    if (!events[job]) return null; 
    const event = events[job].find(e => Math.random() < e.chance); 
    if (event) {
        event.effect(user); 
        return event.outcome; 
    }
    return null; 
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Realiza tu trabajo y gana recompensas.'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const guildId = interaction.guild.id;
        const key = `${guildId}-${discordId}`; 
        const now = Date.now();
        const cooldown = cooldowns.get(key);
        if (cooldown && now < cooldown) {
            const remainingTime = Math.ceil((cooldown - now) / 60000);
            return interaction.reply({
                content: `⏳ Debes esperar ${remainingTime} minutos antes de volver a trabajar.`,
                ephemeral: true,
            });
        }

        let user = await User.findOne({ discordId, guildId });
        if (!user) {
            user = new User({
                discordId,
                guildId,
                username: interaction.user.username,
            });
        }

        if (!user.job) {
            const noJobEmbed = new EmbedBuilder()
                .setTitle('❌ Sin Trabajo')
                .setDescription('No tienes un trabajo asignado. Usa `/job` para elegir uno.')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [noJobEmbed] });
        }

        const earnings = {
            politico: 4000,
            camello: 2000,
            policia: 1500,
            taxista: 1000,
            ladrón: 1500,
            hacker: 1800,
        }[user.job] || 1000; 

        user.cash += earnings;

        const eventMessage = randomEvent(user.job, user);
        await user.save(); 

        const cooldownDuration = 60 * 5000; 
        cooldowns.set(key, now + cooldownDuration);

        const workEmbed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`Has trabajado como ${user.job} y has recibido ${earnings} 🪙`)
            .setColor('#00FF00')
            .addFields(
                { name: 'Efectivo actual:', value: `${user.cash} 🪙`, inline: true },
                { name: 'Reputación actual:', value: `${user.reputation} 🌟`, inline: true },

            )

            .setFooter({ text: "No olvides guardar tu dinero en el banco.", iconURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F354%2F706%2Fpng-clipart-logo-abanca-mobile-banking-banesco-bank-blue-company-thumbnail.png&f=1&nofb=1&ipt=ad6f245ab67fc064becc586d298548da90fbd137c80dc6499e206b7758c3bafb&ipo=images"})

        await interaction.reply({ embeds: [workEmbed] });

        if (eventMessage) {
            const eventEmbed = new EmbedBuilder()
                .setTitle('🎲 Evento Aleatorio')
                .setDescription(eventMessage)
                .setColor('#FFFF00');
            await interaction.followUp({ embeds: [eventEmbed] });
        }
    },
};
