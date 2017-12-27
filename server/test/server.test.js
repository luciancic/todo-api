const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todo) => {
          expect(todo[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not save an invalid todo', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err)
          return done(err);

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID()}`)
      .expect(404)
      .end(done);
  });

  it('should return 400 if invalid id', (done) => {
    request(app)
      .get('/todos/123')
      .expect(400)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete the first todo', (done) => {
    let id = todos[0]._id.toHexString();



    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((doc) => {
          expect(doc).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID()}`)
      .expect(404)
      .end(done);
  });

  it('should return 400 if invalid id', (done) => {
    request(app)
      .delete(`/todos/123}`)
      .expect(400)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the first todo', (done) => {
    let id = todos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${id}`)
      .send({completed: true})
      .expect(200)
      .expect((res) => {
        expect(res.completed).toBe(true);
        expect(res.completedAt).toExist();
      }).end((err, res) => {
        Todo.findById(id).then((doc) => {
          expect(doc).toExist();
          expect(doc.completed).toBe(true);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if not found', (done) => {
    request(app)
      .patch(`/todos/${new ObjectID()}`)
      .expect(404)
      .end(done);
  });

  it('should return 400 if invalid id', (done) => {
    request(app)
      .patch(`/todos/123}`)
      .expect(400)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', '123456')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('GET /users', () => {
  it('should get all users', (done) => {
    request(app)
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res).toExist();
        expect(res.body.length).toBe(2);
        expect(res.body[0].email).toExist();
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a new user', (done) => {
    let email = 'email@email.com';
    let password = 'password';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user._id).toExist();
          expect(user.password).toNotBe(password);
          done();
        });
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({email: 'email', password: 'password'})
      .expect(400)
      .end(done);
  });

  it('should not create a user if email is in use already', (done) => {
    request(app)
      .post('/users')
      .send({email: 'andrew@example.com', password: 'password'})
      .expect(400)
      .end(done);
  });
});
