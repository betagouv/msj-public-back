const express = require('express')
const bodyParser = require('body-parser')

const usersRoutes = require('./routes/users-routes')

const app = express()

app.use(usersRoutes)

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Mon Suivi Justice back-end listening on", port);
});