const express = require('express'),
    cors = require('cors'),
    dotenv = require('dotenv'),
    body_parser = require('body-parser'),
    PORT = 3000,
    app = express();

dotenv.config({ path: './.env' });
app.use(cors());
app.use(body_parser.json());
const router = require('./routes/router');

// We have database routes and queries in here
app.use(router);

app.listen(PORT, () => {
    console.log('Your backend is running on : https://localhost:' + PORT)
});