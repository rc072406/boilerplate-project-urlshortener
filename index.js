require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlparser = require('url');

const port = process.env.PORT || 3000;

const urlDatabase = [];
let urlCounter = 1;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
    
      return res.json({ error: 'invalid url' });
    }

    let existingEntry = urlDatabase.find(entry => entry.original_url === originalUrl);

    if (existingEntry) {
      return res.json({
        original_url: existingEntry.original_url,
        short_url: existingEntry.short_url
      });
    }

    
    const newEntry = {
      original_url: originalUrl,
      short_url: urlCounter++
    };

    urlDatabase.push(newEntry);
    res.json(newEntry);
  });
});


app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrlParam = req.params.short_url;
  const shortUrlId = parseInt(shortUrlParam, 10);

  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrlId);

  if (urlEntry) {
   
    return res.redirect(urlEntry.original_url);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
