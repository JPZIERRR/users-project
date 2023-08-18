const express = require('express');
const exphbs = require('express-handlebars');

const conn = require('./db/conn');

const User = require('./models/User');
const Address = require('./models/Address');

const path = require('path');

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

app.engine('hbs', exphbs.engine());
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

// Métodos post

// criar usuário com formulário
app.post('/users/create', async (req, res) => {
  const name = req.body.name;
  const occupation = req.body.occupation;
  let newsletter = req.body.newsletter;

  if (newsletter === 'on') {
    newsletter = true;
  } else {
    newsletter = false;
  }

  await User.create({ name, occupation, newsletter });

  res.redirect('/users');
});

// deletar usuário com formulário
app.post('/users/delete/:id', async (req, res) => {
  const id = req.params.id;

  await User.destroy({ where: { id: id } });

  res.redirect('/users');
});

// atualizar usuário com formulário
app.post('/users/update', async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const occupation = req.body.occupation;
  let newsletter = req.body.newsletter;

  if (newsletter === 'on') {
    newsletter = true;
  } else {
    newsletter = false;
  }

  const userData = {
    id,
    name,
    occupation,
    newsletter,
  };

  await User.update(userData, { where: { id: id } });

  res.redirect('/users');
});

// Criar endereço com formulário
app.post('/address/create', async (req, res) => {
  const UserId = req.body.UserId;
  const street = req.body.street;
  const number = req.body.number;
  const city = req.body.city;

  const address = {
    UserId,
    street,
    number,
    city,
  };

  await Address.create(address);

  res.redirect(`/users/edit/${UserId}`);
});

// deletar endereço com formulário
app.post('/address/delete', async (req, res) => {
  const UserId = req.body.UserId;
  const id = req.body.id;

  await Address.destroy({ where: { id: id } });

  res.redirect(`/users/edit/${UserId}`);
});

// Métodos get

// retornar a página de edição de usuário
app.get('/users/edit/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findOne({ include: Address, where: { id: id } });

    res.render('usersedit', { user: user.get({ plain: true }) });
  } catch (err) {
    console.log(err);
  }
});

// retornar a página de criação de usuário
app.get('/users/create', (req, res) => {
  res.render('adduser');
});

// retornar a página de usuário
app.get('/users', async (req, res) => {
  const users = await User.findAll({ raw: true });

  res.render('users', { users: users });
});

// retornar a página de usuário individual
app.get('/users/:id', async (req, res) => {
  const id = req.params.id;

  const user = await User.findOne({ raw: true, where: { id: id } });

  res.render('usersview', { user });
});

// retornar a home
app.get('/', (req, res) => {
  res.render('home');
});

// escutar o servidor com banco sequelize
conn
  .sync()
  // Refazer tabelas (apaga todos os dados existentes nas colunas)
  // .sync({ force: true })
  .then(() => {
    app.listen(3003);
  })
  .catch(err => {
    console.log(err);
  });
