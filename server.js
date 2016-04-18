'use strict';

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use('/', express.static('app'));

var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var api = express.Router();

api.use(function(req, res, next){
  console.log('> '  + req.method + ' ' + req.url);
  if(JSON.stringify(req.body) !== JSON.stringify({})){
    console.log(' ', req.body);
  }
  next();
});

var todoList = [{itemId: 123, text: 'Ala ma kota', done: true}];

api.get('/todo-list', function(req, res){
  res.json(todoList).end();
});
api.post('/todo-list', function(req, res){
  todoList.push(req.body);
  res.status(200).end();
});
api.post('/todo-list/:id/complete', function(req, res){
  
  var id = req.params.id;
  
  todoList.forEach(function(item){
    if(item.id === id){
      item.done = req.body.done;
    }
  });
  
  res.status(200).end();
});

app.use('/api', api);

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

