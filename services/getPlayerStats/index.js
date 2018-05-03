const axios = require('axios');
const { apikey } = require('../../config');

function getPlayerStats(username, platform) {
  const url = `https://api.fortnitetracker.com/v1/profile/${platform}/${username}`;

  return axios
    .get(url, { headers: { 'TRN-Api-Key': apikey } })
    .then(response => response.data)
    .catch(error => {
      console.log(error);
    });
}

module.exports = getPlayerStats;
