const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true },
    guildId: { type: String, required: true}, 
    username: { type: String, required: true },
    cash: { type: Number, default: 1000 },
    bank: { type: Number, default: 100 },  
    lastDaily: { type: Date, default: null }, 
    job: { type: String, default: null },
    reputation: { type: Number, default: 0 },
});

userSchema.index({ discordId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
