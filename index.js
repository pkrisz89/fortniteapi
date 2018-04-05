const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
app.server = http.createServer(app);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.server.listen(process.env.PORT || 3000, () => {
  console.log(`Started on port ${app.server.address().port}`);
});

app.get('/', (req, res) => {
  res.json('hello');
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.json(req.body.username);
});
