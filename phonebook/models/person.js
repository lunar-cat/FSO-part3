const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;
mongoose.connect(url)
  .then(() => console.log('connected'))
  .catch(e => console.log('error', e));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    match: /([0-9]{8,})|([0-9]{2,3})-(\d+)/
  }
});

personSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);