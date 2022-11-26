const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

app.post('/users', (request, response) => {
  const { name , username } = request.body

  const userAlreadyExists = users.some((userTodos)=> userTodos.username === username)

  if(userAlreadyExists){
    return response.status(400).json({
      "error":"Usuário já existe"
    })
  }

  const userTodos = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  }

  users.push(userTodos)

  return response.status(201).json(userTodos)

});

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userTodos = users.find((userTodos)=>userTodos.username === username)

  if(!userTodos){
    return response.status(404).json({
      "error":"Usuário não existe"
    })
  }

  request.userTodos = userTodos

  return next()

}

app.use(checksExistsUserAccount)

app.post('/todos', (request, response) => {
  const { title , deadline } = request.body

  const { userTodos } = request

  const insertTodos = { 
      id: uuidv4(), // precisa ser um uuid
      title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
  }

  userTodos.todos.push(insertTodos)

  return response.status(201).json(insertTodos)

});

app.get('/todos',  (request, response) => {
  return response.status(200).json(request.userTodos.todos)
});

app.put('/todos/:id', (request, response) => {
  const { title , deadline } = request.body

  const { userTodos } = request

  const { id } = request.params

  const todos = userTodos.todos.find((todos)=>todos.id === id)

  if(!todos){
    return response.status(404).json({
      "error":"Todo não existe"
    })
  }

  todos.title = title
  todos.deadline = deadline

  return response.status(200).json(todos)

});

app.patch('/todos/:id/done', (request, response) => {
  const { userTodos } = request

  const { id } = request.params

  const todos = userTodos.todos.find((todos)=>todos.id === id)

  if(!todos){
    return response.status(404).json({
      "error":"Todo não existe"
    })
  }

  todos.done = true

  return response.status(200).json(todos)

});

app.delete('/todos/:id', (request, response) => {
  const { userTodos } = request

  const { id } = request.params

  const todos = userTodos.todos.find((todos)=>todos.id === id)

  if(!todos){
    return response.status(404).json({
      "error":"Todo não existe"
    })
  }

  userTodos.todos.splice(todos,1)

  return response.status(204).send()

});

module.exports = app;