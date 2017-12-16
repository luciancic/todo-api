const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect (mongoUri, {
  useMongoClient: true
});

exports.mogoose = mongoose;
