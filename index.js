const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const apikey = require('./apikey');

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.listen(process.env.PORT || 3000, () => {
  console.log('Started');
});

app.get('/', (req, res) => {
  res.json('hello');
});

app.post('/', (req, res) =>
  getPlayerDetails(req.body.username).then(response => {
    res.json(response);
  })
);

function getPlayerDetails(nickname) {
  const platform = 'pc' || 'xbl' || 'psn';
  const url = `https://api.fortnitetracker.com/v1/profile/${platform}/${nickname}`;

  return axios
    .get(url, { headers: { 'TRN-Api-Key': apikey } })
    .then(response => response.data)
    .catch(error => {
      console.log(error);
    });
}
