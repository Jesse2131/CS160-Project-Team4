'use strict';

const express = require('express');

// Constants
const PORT = 13000;
// For local, set host to localhost, for docker set to 0.0.0.0
const HOST = 'localhost';

// App
const app = express();

// When the app is first run, we go the the default page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/HTML/index.html');
});
// For all other pages load them from directories directly
app.use(express.static(__dirname + '/HTML'));
app.use(express.static(__dirname + '/public'));

  
app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});