const { Router } = require("express");
const inventoryController = require("../controllers/inventoryController");
const inventoryRouter = Router();

inventoryRouter.get('/', inventoryController.getAllGames);
inventoryRouter.get('/details/:game', inventoryController.getGameDetails);
inventoryRouter.get('/category/:category', inventoryController.getAllGamesByCategory);
inventoryRouter.get('/create', inventoryController.getCreateGameForm);
inventoryRouter.post('/create', inventoryController.postCreateGameForm);


module.exports = { inventoryRouter };