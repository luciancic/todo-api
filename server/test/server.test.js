const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
  }, {
    _id: new ObjectID(),
    text: 'Second test todo'
  }];

beforeEach((done) => {
  Todo.remove({})
  .then(() => Todo.insertMany(todos))
  .then(() => done());
});

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
