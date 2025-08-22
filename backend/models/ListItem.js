const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  notes: {
    type: String,
    default: '',
  },
  agent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Agent',
    required: true,
  },
  uploadBatch: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ListItem', ListItemSchema);