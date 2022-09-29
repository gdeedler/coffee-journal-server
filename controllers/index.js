const db = require('../db')

module.exports = {
  getAll: async (req, res) => {
    const coffees = await db.query(`
      SELECT c.coffee_id, c.name, c.country, c.region, c.producer, c.elevation, c.process, c.roaster, array_agg(n.note) AS notes
      FROM coffees c
      INNER JOIN notes n
      ON n.coffee_id = c.coffee_id
      WHERE c.coffee_id NOT IN (select coffee_id from coffees_users where user_id = $1)
      GROUP BY c.coffee_id
      ORDER BY c.name ASC;
    `,[req.userId]);
    res.status(200);
    res.send(coffees.rows);
  },
  getOneCoffee: async (req, res) => {
    const coffee = await db.query(`
      SELECT c.coffee_id, c.name, c.country, c.region, c.producer, c.elevation, c.process, c.roaster, array_agg(n.note) AS notes
      FROM coffees c
      INNER JOIN notes n
      ON n.coffee_id = c.coffee_id
      WHERE c.coffee_id = $1
      GROUP BY c.coffee_id
    `, [req.params.coffeeId])
    res.status(200);
    res.send(coffee.rows);
  },
  getUserCoffees: async (req, res) => {
    const userId = req.userId;
    const coffees = await db.query(`
    SELECT c.coffee_id, c.name, c.country, c.region, c.producer, c.elevation, c.process, c.roaster, array_agg(n.note) AS notes
    FROM coffees c
    INNER JOIN notes n
    ON n.coffee_id = c.coffee_id
    INNER JOIN coffees_users cu
    ON c.coffee_id = cu.coffee_id
    INNER JOIN users u
    ON cu.user_id = u.user_id
    GROUP BY c.coffee_id;
    `)
    res.status(200);
    res.send(coffees.rows);
  },
  getBrews: async (req, res) => {
    const userId = req.userId;
    const coffeeId = req.query.coffeeId;
    const brews = await db.query(`
    SELECT b.rating, b.dose, b.method, b.date, b.bitter_sour
    FROM brews b
    WHERE b.coffee_id = $1 AND b.user_id = $2
    ORDER BY b.date ASC;
    `, [coffeeId, userId])
    res.status(200);
    res.send(brews.rows);
  },
  getAllBrews: async (req, res) => {
    const brews = await db.query(`
      SELECT b.rating, b.dose, b.method, b.date, b.bitter_sour, b.coffee_id
      FROM brews b
      WHERE b.user_id = $1`, [req.userId])
    res.status(200);
    res.send(brews.rows);
  },
  addBrew: async (req, res) => {
    const userId = req.userId;
    const {rating, dose, method, coffeeId, bitter_sour} = req.body;
    const response = await db.query(`
      INSERT INTO brews (coffee_id, rating, dose, method, user_id, bitter_sour)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [coffeeId, rating, dose, method, userId, bitter_sour])
    console.log(response);
    res.sendStatus(201);
  },
  addCoffee: async (req, res) => {
    const userId = req.userId;
    const coffeeId = req.body.coffee_id;
    const response = await db.query(`
      SELECT *
      FROM coffees_users cu
      WHERE cu.coffee_id = $1 AND cu.user_id = $2
    `,[coffeeId, userId])
    if(response.rows.length === 0) {
      await db.query(`
        INSERT INTO coffees_users (coffee_id, user_id)
        VALUES ($1, $2)
      `, [coffeeId, userId]);
    }
    res.sendStatus(201);
  },
  addUser: async (req, res) => {
    const userId = req.userId;
    let userExists = await db.query(`
      SELECT * FROM users
      WHERE user_id = $1
    `, [userId]);
    if(userExists.rows.length > 0) {
      res.sendStatus(200);
      return;
    }
    const response = await db.query(`
      INSERT INTO users (user_id)
      VALUES ($1)
    `, [userId])
    res.sendStatus(201);
  },
  deleteCoffee: async (req, res) => {
    await db.query(`
      DELETE FROM coffees_users
      WHERE coffee_id = $1
      AND user_id = $2
    `,[req.params.coffeeId + '', req.userId])
    await db.query(`
      DELETE FROM brews
      WHERE coffee_id = $1
      AND user_id = $2
    `,[req.params.coffeeId + '', req.userId])
    res.sendStatus(204);
  }
}