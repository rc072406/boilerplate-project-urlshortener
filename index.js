require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urlDatabase = [];
let idCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
 
  const urlRegex = /^https?:\/\/(.*)/;
  
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  
  const shortUrl = idCounter++;
  urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
  
  res.json({ 
    original_url: originalUrl, 
    short_url: shortUrl 
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;

  const entry = urlDatabase.find(item => item.short_url == id);
  
  if (entry) {
    return res.redirect(entry.original_url);
  } else {
    return res.json({ error: "No short URL found" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
