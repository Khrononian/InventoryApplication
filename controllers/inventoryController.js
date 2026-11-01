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
            
            // console.log('OBJ', gameObjectData)
            await sleep(300);
        } catch (error) {
            console.error(`Error fetching specific game data for appid ${filteredGames[i].appid}, which is ${filteredGames[i]}:`, error.message);
        }
    }

    res.render('index', { title: 'Games Inventory', dbGames });
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

    res.render('categoryDetails', { title: 'Categorized Games', categoryName, categorizedGames })
}

exports.getCreateGameForm = (req, res) => {
    res.render('createGame', { title: 'Create Game based on Steam!' });
}

exports.postCreateGameForm = async (req, res) => {
    const { title, genre, developer, release_date, description } = req.body;
    const storeSearchUrl = await fetch(`https://store.steampowered.com/api/storesearch?term=${encodeURIComponent(title)}&l=english&cc=US`)
    const searchUrlJson = await storeSearchUrl.json()
    const escapedQuery = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    const pattern = escapedQuery.replace(/\s+/g, '[\\s\\-_]*'); 
    const gameRegex = new RegExp(`^${pattern}s?$`, 'i');
    const match = searchUrlJson.items.find(item => gameRegex.test(item.name));
    const gameDetail = await fetch(`https://store.steampowered.com/api/appdetails?appids=${match.id}`);
    const gameDetailJson = await gameDetail.json()
    const gameName = match.name;
    const gameData = []

    if (!searchUrlJson.items || searchUrlJson.total === 0) {
        // console.log('DID THIS COMMAND', storeSearchUrl, searchUrlJson)
        return res.render('createGame', {
            error: `${title} was not found on Steam. Check your spelling!`
        })
    }

    gameData.push({
        name: match.name,
        url: gameDetailJson[match.id].data.header_image
    })

    await db.insertGame({ gameName, genre, developer, release_date, description })
    await db.updateGameImage(gameData)

    console.log('DID NOT FIND', searchUrlJson, 'MATCHED HERE', release_date, match.id, match, gameName, 'JSON', gameDetailJson)

    res.redirect('/');
}

exports.getUpdateGameForm = async (req, res) => {
    const gameTitle = req.params.gameTitle
    const gameData = await db.getGameValues(gameTitle)
    const categories = await db.getAllCategories()
    let formattedDate = ''

    if (gameData.rows[0].release_date) {
        const d = new Date(gameData.rows[0].release_date)

        formattedDate = d.toISOString().split('T')[0]
    }

    res.render('updateGame', { title: 'Update Game based on Steam!', gameTitle, gameData, categories, formattedDate })
}

exports.postUpdateGameForm = async (req, res) => {
    const { title, genre, developer, release_date, description } = req.body;
    const gameTitle = req.params.gameTitle

    await db.getGameValues(gameTitle)
    await db.updateGameValues({ title, genre, developer, release_date, description })

    res.redirect('/')
}

exports.postDeletedGame = async (req, res) => {
    const deletedGame = req.body.delete;

    await db.deleteGame(deletedGame)

    res.redirect('/')
}