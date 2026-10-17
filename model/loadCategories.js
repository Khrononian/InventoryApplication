const db = require('../db/queries');

const loadCategories = async (req, res, next) => {
    try {
        const categories = await db.getAllCategories();
        
        res.locals.categories = categories;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading categories');
        next(error);
    }
};

module.exports = loadCategories;