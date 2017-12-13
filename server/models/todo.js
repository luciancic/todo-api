let mongoose = require('mongoose');

let Todo = mongoose.model('Todo', {
  text: {type: String, required: true},
  completed: {type: Boolean, default: false},
  completedAt: {type: Number, default: null}
});

exports.Todo = Todo;
