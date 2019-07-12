const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

let userOneId = new ObjectID();
let userTwoId = new ObjectID();
const users = [
  {
    _id: userOneId,
    email: 'andrew@example.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({
        _id: userOneId,
        access: 'auth'
      }, 'secretSalt')
      .toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'lucian@example.com',
    password: 'userTwoPass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({
        _id: userTwoId,
        access: 'auth'
      }, 'secretSalt')
      .toString()
    }]
  }
];

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: users[0]._id
  }, {
    _id: new ObjectID(),
    text: 'Second test todo',
    _creator: users[1]._id
  }
];

const populateTodos = (done) => {
  Todo.deleteMany({})
  .then(() => Todo.insertMany(todos))
  .then(() => done());
};

const populateUsers = (done) => {
  User.deleteMany({}).then(() => {
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
