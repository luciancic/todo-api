let mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp';

mongoose.Promise = global.Promise;
mongoose.connect (mongoUri, {
  useMongoClient: true
});

exports.mogoose = mongoose;
