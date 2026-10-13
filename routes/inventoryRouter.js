const { Router } = require("express");
const inventoryController = require("../controllers/inventoryController");
const inventoryRouter = Router();

inventoryRouter.get('/', inventoryController.getAllGames);
inventoryRouter.get('/create', inventoryController.getCreateGameForm);

module.exports = { inventoryRouter };