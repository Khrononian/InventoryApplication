const pool = require("./pool");

exports.getAllGames = async () => {
    const { rows } = await pool.query('SELECT * FROM games');
    const gamesData = await fetch('https://api.steampowered.com/IStoreService/GetAppList/v1/?key=D9758252168028545F0436A92036B796');
    const gamesList = await gamesData.json();
    const gamesJson = gamesList.response.apps;

    return {rows, gamesJson};
}

exports.getAllCategories = async () => {
    const { rows } = await pool.query('SELECT * FROM categories');

    return rows;
}