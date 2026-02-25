require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlparser = require('url');

const urlDatabase = [];
let urlCounter = 1;


const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


app.post('/api/shorturl', (req, res)=>{
  const originalUrl = req.body.url;
  

  let parsedUrl;
  try{
    parsedUrl = new URL(originalUrl);
    if(parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:'){
      throw new Error('Invalid Protocol');
    }
  }catch (error){
    return res.json({error: 'invalid url'});
  }

  const hostname = parsedUrl.hostname;


  dns.lookup(hostname, (err, address)=>{
    if(err||!address){
      return res.json({error: 'invalid url'});
    }

    
    let existingEntry = urlDatabase.find(entry=>entry.original_url === originalUrl);
    if(existingEntry){
      res.json({
        original_url: existingEntry.original_url,
        short_url: existingEntry.short_url
      });
    }else{
 
      const newShortUrl = urlCounter++;
      const newEntry = {
        original_url: originalUrl,
        short_url: newShortUrl
      };
      urlDatabase.push(newEntry);
      res.json({
      original_url: newEntry.original_url,
      short_url: newEntry.short_url
    });
    }
  })
})




app.get('/api/shorturl/:short_url', (req, res) => {

  const shortUrlId = parseInt(req.params.short_url, 10);

 
  if (isNaN(shortUrlId)) {
    return res.status(400).json({ error: 'Wrong format' });
  }

 
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrlId);

  
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});
