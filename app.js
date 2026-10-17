require('dotenv').config();
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
const path = require('node:path');
const loadCategories = require('./model/loadCategories');
const { inventoryRouter } = require('./routes/inventoryRouter');
const { error } = require('node:console');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(loadCategories);
app.use('/', inventoryRouter);

app.listen(port, () => {
    if (error) console.error(error);

    console.log(`Server is running on port ${port}`);
})