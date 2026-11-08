const db = require("../db/queries");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const searchFetchedGame = async (title) => {
    const storeSearchUrl = await fetch(`https://store.steampowered.com/api/storesearch?term=${encodeURIComponent(title)}&l=english&cc=US`)
    const searchUrlJson = await storeSearchUrl.json()
    const escapedQuery = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    const pattern = escapedQuery.replace(/\s+/g, '[\\s\\-_]*'); 
    const gameRegex = new RegExp(`^${pattern}s?$`, 'i');
    const match = searchUrlJson.items.find(item => gameRegex.test(item.name));
    const gameDetail = await fetch(`https://store.steampowered.com/api/appdetails?appids=${match.id}`);
    const gameDetailJson = await gameDetail.json();
    const gameName = match.name;
    const gameImage = []

    if (!searchUrlJson.items || searchUrlJson.total === 0) {
        return res.render('createGame', {
            error: `${title} was not found on Steam. Check your spelling!`
        })
    }

    gameImage.push({
        name: match.name,
        url: gameDetailJson[match.id].data.header_image
    })


    return { gameName, gameImage }
}

const isOriginalGame = (gameTitle) => {
    const originalGames = ['Speed', 'Terraria', 'Subnautica', 'Batman', 'The Long Dark', 'Hollow Knight',
        'Left 4 Dead 2', 'Wolfenstein', 'Cat Simulator', 'Counter-Strike 2', 'F.E.A.R.'
    ];

    return originalGames.some(seed => new RegExp(`^${seed}`, 'i').test(gameTitle));
}

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
            await sleep(300);
        } catch (error) {
            console.error(`Error fetching specific game data for appid ${filteredGames[i].appid}, which is ${filteredGames[i]}:`, error.message);
        }
    }

    res.render('index', { title: 'Games Inventory', dbGames, pinError: null, adminPassword: undefined, isOriginalGame });
}

exports.getGameDetails = async (req, res) => {
    const gameTitle = req.params.game;
    const getGames = await db.getAllGames();
    const gameDetails = await db.findGameByTitle(gameTitle);
    const filteredGame = getGames.gamesJson.find(game => game.name === gameTitle);
    const specificGame = await fetch(`https://store.steampowered.com/api/appdetails?appids=${filteredGame.appid}`);
    const specificGameJson = await specificGame.json();

    res.render('gameDetails', { gameTitle, gameDetails, imageUrl: specificGameJson[filteredGame.appid].data.header_image, isOriginalGame: isOriginalGame(gameTitle) });
}

exports.getAllGamesByCategory = async (req, res) => {
    const categoryName = req.params.category;
    const categorizedGames = await db.getGamesByCategory(categoryName)

    res.render('categoryDetails', { title: 'Categorized Games', categoryName, categorizedGames })
}

exports.getCreateGameForm = async (req, res) => {
    res.render('createGame', { title: 'Create Game based on Steam!', formData: undefined });
}

exports.postCreateGameForm = async (req, res) => {
    const { title, genre, developer, release_date, description } = req.body;
    const { gameName, gameImage } = await searchFetchedGame(title)
    
    if (await db.findGameByTitle(gameName)) {
        return res.render('createGame', {
            error: `${gameName} already exists in the database, cannot create a duplicate entry.`,
            formData: req.body
        })
    }

    if (gameName == undefined) {
        return res.render('createGame', {
            error: `Game does not exist in steam api, try another game!`,
            formData: req.body
        })
    }

    await db.insertGame({ gameName, genre, developer, release_date, description })
    await db.updateGameImage(gameImage)

    res.redirect('/');
}

exports.getUpdateGameForm = async (req, res) => {
    const gameTitle = req.params.gameTitle
    const adminPassword = req.query.adminPass
    const gameData = await db.getGameValues(gameTitle)
    const categories = await db.getAllCategories()
    const gameDetails = await db.findGameByTitle(gameTitle)
    let formattedDate = ''

    if (isOriginalGame(gameTitle)) {
        if (adminPassword == undefined) {
            return res.render(`gameDetails`, {
                approvalError: `This requires admin approval!`,
                gameTitle,
                gameData,
                gameDetails,
                imageUrl: gameDetails.game_img.url,
                
            })
        }
        if (adminPassword !== 'admin532/02s') {
            return res.render(`gameDetails`, {
                approvalError: `This requires admin approval!`,
                pinError: `Incorrect Admin Password!`,
                gameTitle,
                gameData,
                gameDetails,
                imageUrl: gameDetails.game_img.url,
            })
        }
    }

    if (gameData.rows[0].release_date) {
        const d = new Date(gameData.rows[0].release_date)

        formattedDate = d.toISOString().split('T')[0]
    }

    res.render('updateGame', { title: 'Update Game based on Steam!', gameTitle, gameData, categories, formattedDate })
}

exports.postUpdateGameForm = async (req, res) => {
    const { title, genre, developer, release_date, description } = req.body;
    const gameTitle = req.params.gameTitle
    const gameData = await db.getGameValues(gameTitle)
    const { gameName, gameImage } = await searchFetchedGame(title)
    const categories = await db.getAllCategories();

    if (title == gameTitle) {
        return res.render('updateGame', {
            error: `${gameTitle} already exists, change the name!`,
            title: 'Update Game based on Steam!',
            gameTitle,
            gameData,
            categories,
            formattedDate: new Date(gameData.rows[0].release_date).toISOString().split('T')[0],
            formData: req.body
        })
    }

    if (gameData.rows[0].release_date) {
        const d = new Date(gameData.rows[0].release_date)

        formattedDate = d.toISOString().split('T')[0]
    }

    await db.getGameValues(gameTitle)
    await db.updateGameValues({ gameName, genre, developer, release_date, description }, gameTitle)
    await db.updateGameImage(gameImage)

    res.redirect('/')
}

exports.getDeleteGameForm = async (req, res) => {
    const gameTitle = req.params.gameTitle;
    const adminPassword = req.query.adminPass
    
    if (isOriginalGame(gameTitle)) {
        if (adminPassword == '') {
            return res.render('delete', {
                approvalError: `This requires admin approval!`,
                gameTitle,
                adminPassword: ''
            })
        }
        if (adminPassword !== 'admin532/02s') {
            return res.render('delete', {
                approvalError: `This requires admin approval!`,
                pinError: `Incorrect Admin Password!`,
                gameTitle,
                adminPassword
            })
        }
    }

    res.render('delete', { gameTitle })
}

exports.postDeletedGame = async (req, res) => {
    const deletedGame = req.body.delete;

    await db.deleteGame(deletedGame)

    res.redirect('/')
}