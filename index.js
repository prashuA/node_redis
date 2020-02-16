var express = require('express');
var app = express();
const path = require('path');
const redis = require('redis');
const axios = require('axios');
const responseTime = require('response-time')


// create and connect redis client to local instance.
const client = redis.createClient();

// Print redis errors to the console
client.on('error', (err) => {
  console.log("Error " + err);
});


app.get('/', function(req, res){
   res.send("Hello world!");
});


app.get('/mnjuser/homepage', function(req, res){
	console.log(path,111)
   res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/mnjuser/profile', function(req, res){
	console.log(path,111)
   res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/srp', function(req, res){
   res.send("Hello SRP!");
});


app.use(responseTime());


app.get('/search', (req, res) => {
	//console.log(req,22322323);
  const query = (req.query.query).trim();
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${query}`;

  // Try fetching the result from Redis first in case we have it cached
  return client.get(`wikipedia:${query}`, (err, result) => {
    // If that key exist in Redis store
    if (result) {
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
      console.log('if');
    } else { // Key does not exist in Redis store
      // Fetch directly from Wikipedia API
      console.log('else');
      return axios.get(searchUrl)
        .then(response => {
          const responseJSON = response.data;
          // Save the Wikipedia API response in Redis store
          client.setex(`wikipedia:${query}`, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));
          // Send JSON response to client
          console.log(client,121212121);
          return res.status(200).json({ source: 'Wikipedia API', ...responseJSON, });
        })
        .catch(err => {
          return res.json(err);
        });
    }
  });
});


//app.listen(3000);
app.listen(3000, () => {
  console.log('Server listening on port: ', 3000);
});