const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

MongoClient.connect('mongodb://localhost:27017/TodoApp', function(err, db) {
	assert.equal(null, err);
	console.log("Connected to server");

	// const collection = db.collection('Todos');
	// collection.insertOne({text: 'Take an easy day'}, (err, res) => {
	// 	assert.equal(null, err);
	// 	console.log(JSON.stringify(res));
	// });
	//
	// collection.insertMany([
	// 		{text: 'Take an easy day'},
	// 		{text: 'Have a cold one'}
	// 	],
	// 	(err, res) => {
	// 		assert.equal(null, err);
	// 		console.log(JSON.stringify(res));
	//
	// 		collection.find().toArray((err, docs) => {
	// 			assert.equal(null, err);
	// 			console.log(JSON.stringify(docs));
	//
	// 			db.close();
	// 		});
	// 	}
	// );

	db.collection('Users')
	.findOneAndDelete({name: 'Andrew'})
	.then((res) => console.log(res));
	db.close();
});
