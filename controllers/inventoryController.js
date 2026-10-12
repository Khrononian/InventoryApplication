const db = require("../db/queries");
// const app = require("../app");

// app.locals.categories = db.getAllCategories();

exports.getAllGames = async (req, res) => {
    const getGames = await db.getAllGames();
    const dbGames = getGames.rows.filter(game => game.title.match(/[A-Z][a-z].*$/i));
    const filteredGames = getGames.gamesJson.filter(game => dbGames.some(dbGame => dbGame.title === game.name));
    let specificGameData = [];

    for (let i = 0; i < filteredGames.length; i++) {
        const specificGame = await fetch(`https://store.steampowered.com/api/appdetails?appids=${filteredGames[i].appid}`);
        const specificGameJson = await specificGame.json();
        
        // specificGameData[filteredGames[i].appid] = specificGameJson;

        // filteredGames[i].details = specificGameData[filteredGames[i].appid].data;
        specificGameData.push(specificGameJson);
    }
    
    // getGames.gameJson.filter(game => game.name.match(/[A-Z][a-z].*$/i) == dbGames.title);

    res.render('index', { title: 'Games Inventory', games: getGames, dbGames, filteredGames, specificGameData });
}

exports.getAllCategories = async (req, res) => {
    const getCategories = await db.getAllCategories();


}