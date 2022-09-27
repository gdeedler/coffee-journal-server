const express = require('express');
const morgan = require('morgan');
const path = require('path');
const routes = require('./controllers');
const cors = require('cors');
const {auth} = require('express-openid-connect')
require('dotenv').config();

const app = express();
const PORT = process.env.port || 3000;
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: 'http://localhost:3000',
  clientID: 'rLk9JttgMDBldhp0H4Nz9j1JUj7Anm8z',
  issuerBaseURL: 'https://dev-1mdmd8kt.us.auth0.com'
}

const PATH = path.join(__dirname, 'dist');

app.use(express.static(path.join(__dirname, 'dist')))
app.use(morgan('dev'));
app.use(cors());

app.get('/coffees', (req, res) => {
  routes.getAll(req, res);
})
app.get('/:userid/coffees', routes.getUserCoffees);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})