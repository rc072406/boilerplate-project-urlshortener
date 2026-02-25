require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

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

  
  let urlObject;
  try {
    urlObject = new URL(originalUrl);
   
    if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // 2. Verify the domain actually exists
  dns.lookup(urlObject.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // 3. Create entry and push to database
      const shortUrl = idCounter++;
      urlDatabase.push({ 
        original_url: originalUrl, 
        short_url: shortUrl 
      });

      res.json({ 
        original_url: originalUrl, 
        short_url: shortUrl 
      });
    }
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
