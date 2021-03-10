const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [
  // {
  //   id: uuidv4(),
  //   name: 'Usuário 1',
  //   username: 'user1',
  //   todos: [
  //     {
  //       id: 1,
  //       title: "Task1",
  //       done: false,
  //       deadline: "2021-02-27T00:00:00.000Z", 
  //       created_at: "2021-02-22T00:00:00.000Z"
  //     }
  //   ]
  // }
];

// setInterval(() => {
//   console.log('----', JSON.stringify(users), '----')
// }, 5000);



function getUser(req) {
  const user = users.find(user => user.id === req.user.id)
  
  if (!user) {
    throw new Error(`Usuário "${req.user.username}" não encontrado`)
  }

  return user
}

function getTodo(id, { todos }) {
  const todoIndex = todos.findIndex(todo => todo.id == id)
  if (todoIndex !== -1) {
    const todo = todos[todoIndex]
    return [todoIndex, todo]
  }

  return []
}

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers
  if (!username) {
    return res.status(401).json({ error: 'Usuário não informado'})
  }

  const user = users.find(user => user.username === username)
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado'})
  }

  req.user = {
    id: user.id,
    name: user.name,
    username: user.username,
  }

  next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const existUser = users.find(user => user.username === username)
  if (existUser) {
    return res.status(400).json({ error: `Já existe usuário para username ${username}`})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)
  return res.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const user = getUser(req)

  return res.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const user = getUser(req)
  const { title, deadline } = req.body

  const todo = {
    title,
    id: uuidv4(),
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  user.todos = [...user.todos, todo]

  return res.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const user = getUser(req)
  const { id: todoId } = req.params
  const { title, deadline } = req.body

  const [todoIndex, todo] = getTodo(todoId, user)
  if (!Number.isInteger(todoIndex)) {
    return res.status(404).json({ error: `To-Do "${todoId}" não encontrado para usuário informado`})
  }
  
  let updatedTodo = {
    ...todo,
    title,
    deadline
  }

  user.todos[todoIndex] = updatedTodo

  return res.status(200).json(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const user = getUser(req)
  const { id: todoId } = req.params

  const [todoIndex, todo] = getTodo(todoId, user)
  if (!Number.isInteger(todoIndex)) {
    return res.status(404).json({ error: `To-Do "${todoId}" não encontrado para usuário informado`})
  }
  
  let updatedTodo = {
    ...todo,
    done: !todo.done
  }

  user.todos[todoIndex] = updatedTodo

  return res.status(200).json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const user = getUser(req)
  const { id: todoId } = req.params

  const [todoIndex] = getTodo(todoId, user)
  if (!Number.isInteger(todoIndex)) {
    return res.status(404).json({ error: `To-Do "${todoId}" não encontrado para usuário informado`})
  }
  
  user.todos.splice(todoIndex, 1)
  return res.status(204).send()
});

module.exports = app;