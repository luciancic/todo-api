require('./config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

let app = express();

const port = process.env.PORT;

app.use(bodyParser.json());


//
// GET routes
//


app.get('/', function (req, res) {
	res.send('Hello World')
})

app.get('/todos', authenticate, async (req, res) => {
	try {
		let todos = await Todo.find({_creator: req.user._id});
		res.send(todos);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.get('/users', (req, res) => {
	User.find().then((users) => {
		res.send(users);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/users/me', authenticate, (req,res) => {
	res.send(req.user);
});

app.get('/todos/:id', authenticate, async (req, res) => {
	let id = req.params.id;
	let creator = req.user._id;

	if (!ObjectID.isValid(id))
		return res.status(400).send('ID you provided is invalid');

	try {
		let todo = await Todo.findOne({_id: id, _creator: creator});
		if (!todo)
			return res.status(404).send('No todo with this ID');
		res.send(todo);
	} catch (e) {
		res.status(400).send(e);
	}
});


//
// POST routes
//


app.post('/todos', authenticate, async (req, res) => {
	let todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});
	try {
		let savedTodo = await todo.save();
		res.send(savedTodo);
	} catch (e) {
		res.status(400).send(e);
	};
});

app.post('/users', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);
	let user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.post('/users/login', (req, res) => {
	let login = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(login.email, login.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user)
		});
	}).catch((e) => {res.status(400).send(e)});
});


//
// DELETE routes
//


app.delete('/todos/:id', authenticate, (req, res) => {
	let id = req.params.id;
	let creator = req.user._id;

	if (!ObjectID.isValid(id)) {
		return res.status(400).send('ID you provided is invalid');
	}

	Todo.findOneAndRemove({_id: id, _creator: creator}).then((todo) => {
		if (!todo) {
			return res.status(404).send('No todo with this ID');
		}
		res.send(todo);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	})
});


//
// PATCH routes
//


app.patch('/todos/:id', authenticate, (req,res) => {
	let id = req.params.id;
	let creator = req.user._id;

	let body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(400).send('ID you provided is invalid');
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({_id: id, _creator: creator}, {$set: body}, {new: true})
	.then((doc) => {
		if (!doc) {
			return res.status(404).send('No todo with this ID');
		}

		res.send(doc);

	}).catch((e) => res.status(400).send(e));
});



app.listen(port, () => {
	console.log(`Server started on port ${port}.`);
});

exports.app = app;
