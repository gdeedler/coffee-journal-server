const db = require('../db')

module.exports = {
  getAll: async (req, res) => {
    const coffees = await db.query(`
    SELECT c.name, c.country, c.region, c.producer, c.elevation, c.process, c.roaster, array_agg(n.note) AS notes
    FROM coffees c
    INNER JOIN notes n
    ON n.coffee_id = c.coffee_id
    GROUP BY c.coffee_id
    ORDER BY c.name ASC;`);
    res.status(200);
    res.send(coffees.rows);
  },
  getUserCoffees: async (req, res) => {
    const userId = req.params.userid;
    console.log('Get coffees', userId);
    const coffees = await db.query(`
    SELECT c.coffee_id, c.name, c.country, c.region, c.producer, c.elevation, c.process, c.roaster, array_agg(n.note) AS notes
    FROM coffees c
    INNER JOIN notes n
    ON n.coffee_id = c.coffee_id
    INNER JOIN coffees_users cu
    ON c.coffee_id = cu.coffee_id
    INNER JOIN users u
    ON cu.user_id = u.user_id
    GROUP BY c.coffee_id
    ORDER BY c.name ASC;
    `)
    res.status(200);
    res.send(coffees.rows);
  },
  getBrews: async (req, res) => {
    const userId = req.query.userId;
    const coffeeId = req.query.coffeeId;
    const brews = await db.query(`
    SELECT b.rating, b.dose, b.method, b.date
    FROM brews b
    WHERE b.coffee_id = $1 AND b.user_id = $2
    ORDER BY b.date ASC;
    `, [coffeeId, userId])
    res.status(200);
    res.send(brews.rows);
  }
}