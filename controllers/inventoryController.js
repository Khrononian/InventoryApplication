const db = require("../db/queries");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.getAllGames = async (req, res) => {
    const getGames = await db.getAllGames();
    const dbGames = getGames.rows.filter(game => game.title?.match(/[A-Z][a-z].*$/i));
    const filteredGames = getGames.gamesJson.filter(game => dbGames.some(dbGame => dbGame.title === game.name));
    const gameObjectData = []

    for (let i = 0; i < filteredGames.length; i++) {
        try {
            const specificGame = await fetch(`https://store.steampowered.com/api/appdetails?appids=${filteredGames[i].appid}`);
            const specificGameJson = await specificGame.json();
            
            gameObjectData.push({
                name: specificGameJson[filteredGames[i].appid].data.name,
                url: specificGameJson[filteredGames[i].appid].data.header_image
            })
            await db.updateGameImage(gameObjectData)
            
            console.log('CONTROLLER', specificGameJson, specificGameJson[filteredGames[i].appid].data.name)

            await sleep(300);
        } catch (error) {
            console.error(`Error fetching specific game data for appid ${filteredGames[i].appid}:`, error.message);
        }
    }

    res.render('index', { title: 'Games Inventory', dbGames });
}

exports.getCreateGameForm = (req, res) => {
    res.render('createGame', { title: 'Create Game' });
}

exports.getGameDetails = async (req, res) => {
    const gameTitle = req.params.game;
    const getGames = await db.getAllGames();
    const gameDetails = await db.findGameByTitle(gameTitle);
    const filteredGame = getGames.gamesJson.find(game => game.name === gameTitle);
    const specificGame = await fetch(`https://store.steampowered.com/api/appdetails?appids=${filteredGame.appid}`);
    const specificGameJson = await specificGame.json();


    res.render('gameDetails', { gameTitle, gameDetails, imageUrl: specificGameJson[filteredGame.appid].data.header_image });
}

exports.getAllGamesByCategory = async (req, res) => {
    const categoryName = req.params.category;
    const categorizedGames = await db.getGamesByCategory(categoryName)

    res.render('categoryDetails', { categoryName, categorizedGames })
}

exports.postCreateGameForm = async (req, res) => {
    const { title, genre, developer, releaseDate, description } = req.body;

    await db.insertGame({ title, genre, developer, releaseDate, description });

    res.redirect('/');
}

