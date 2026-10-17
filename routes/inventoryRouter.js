const { Router } = require("express");
const inventoryController = require("../controllers/inventoryController");
const inventoryRouter = Router();

inventoryRouter.get('/', inventoryController.getAllGames);
inventoryRouter.get('/create', inventoryController.getCreateGameForm);
inventoryRouter.post('/create', inventoryController.postCreateGameForm);
inventoryRouter.get('/details/:game', inventoryController.getGameDetails);

module.exports = { inventoryRouter };