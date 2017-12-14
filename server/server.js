let express = require('express');
let bodyParser = require('body-parser');
let {ObjectID} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

let app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Hello World')
})

app.post('/todos', (req, res) => {
	let todo = new Todo(req.body);

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {

	Todo.find().then((todos) => {
		res.send(todos);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos/:id', (req, res) => {
	let id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(400).send('ID you provided is invalid');
	}

	Todo.findById(id).then((todo) => {
		if (!todo) {
			return res.status(404).send('No todo with this ID');
		}
		res.send(todo);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.listen(3000, () => {
	console.log('Server started on port 3000.');
});

exports.app = app;
