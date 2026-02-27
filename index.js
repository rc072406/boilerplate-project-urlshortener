require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const app = express();

const port = process.env.PORT || 5000;
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
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const parsedUrl = new URL(originalUrl);
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
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrlParam = req.params.short_url;
  const urlEntry = urlDatabase.find(entry => entry.short_url === parseInt(shortUrlParam));

  if (urlEntry) {
    return res.redirect(urlEntry.original_url);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
