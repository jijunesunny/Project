// ../server/app.js
const express = require('express');
const app = express();

// ...중략...
const wildfirePredict = require('../server/api/wildfire-predict');
app.use('/api', wildfirePredict);

app.listen(3000, () => console.log('Server running on port 3000'));
