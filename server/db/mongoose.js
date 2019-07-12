const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect (mongoUri, {
  useNewUrlParser: true
});

mongoose.set('useFindAndModify', false);

exports.mogoose = mongoose;
