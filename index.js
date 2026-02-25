require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlParser = require('url');


const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));


app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


let urlDatabase = [];
let idCounter = 1;



app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  
  
  const parsedUrl = urlParser.parse(originalUrl);


  if (!parsedUrl.protocol || !/^https?:/.test(parsedUrl.protocol)) {
    return res.json({ error: 'invalid url' });
  }

  // Use DNS lookup to verify the site actually exists
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      // Test 2: Store and return the JSON
      const shortUrl = idCounter++;
      urlDatabase.push({ original: originalUrl, short: shortUrl });
      
      res.json({ 
        original_url: originalUrl, 
        short_url: shortUrl 
      });
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  const entry = urlDatabase.find(item => item.short === parseInt(id));
  
  if (entry) {
    res.redirect(entry.original);
  } else {
    res.json({ error: "No short URL found" });
  }
});



app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
