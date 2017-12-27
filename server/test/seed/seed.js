const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
  }, {
    _id: new ObjectID(),
    text: 'Second test todo'
  }];

let id = new ObjectID();
const users = [
  {
    _id: id,
    email: 'andrew@example.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({
        _id: id,
        access: 'auth'
      }, 'secretSalt')
      .toString()
    }]
  },
  {
    _id: new ObjectID(),
    email: 'lucian@example.com',
    password: 'userTwoPass'
  }
];

const populateTodos = (done) => {
  Todo.remove({})
  .then(() => Todo.insertMany(todos))
  .then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
};
