const pool = require("./pool");

exports.getAllGames = async () => {
    const { rows } = await pool.query('SELECT * FROM games');
    const gamesData = await fetch('https://api.steampowered.com/IStoreService/GetAppList/v1/?key=D9758252168028545F0436A92036B796');
    const gamesList = await gamesData.json();
    const gamesJson = gamesList.response.apps;

    return { rows, gamesJson };
}

exports.getAllCategories = async () => {
    const { rows } = await pool.query('SELECT * FROM categories');

    return rows;
}

exports.insertGame = async (gameData) => {
    const { title, genre, developer, release_date, description } = gameData;
    
    await pool.query(
        'INSERT INTO games (title, genre, developer, release_date, description) VALUES ($1, $2, $3, $4, $5)',
        [title, genre, developer, release_date, description]
    );
}