const express = require('express');
const morgan = require('morgan');
const path = require('path');
const routes = require('./controllers');
const cors = require('cors');
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const app = express();
const PORT = process.env.port || 3000;
const checkJwt = auth({
  audience:'Coffee',
  issuerBaseURL: `https://dev-1mdmd8kt.us.auth0.com/`,
})

const PATH = path.join(__dirname, 'dist');

app.use(express.static(path.join(__dirname, './dist')));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  let token = req.headers.authorization;
  if(token) {
    let decoded = jwt.decode(token.replace('Bearer ', '')).sub
    decoded = decoded.split('|')[1];
    req.userId = Number(decoded);
  }
  next();
})

app.get('/api/coffees', checkJwt, (req, res) => {
  routes.getAll(req, res);
});
app.get('/api/auth', checkJwt, routes.addUser);
app.get('/api/coffees/:coffeeId', checkJwt, routes.getOneCoffee);
app.get('/api/coffees', routes.getAll);
app.get('/api/journal/coffees', checkJwt, routes.getUserCoffees)
app.get('/api/brews',checkJwt, routes.getBrews);
app.post('/api/brews/',checkJwt, routes.addBrew);
app.post('/api/coffees',checkJwt, routes.addCoffee);
app.delete('/api/journal/coffees/:coffeeId', checkJwt, routes.deleteCoffee);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
