const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    guildId: { type: String, required: true }, 
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    role: { type: String, default: null },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
