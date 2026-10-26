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
        `INSERT INTO games (title, genre, developer, release_date, description) 
        VALUES ($1, $2, $3, $4, $5)`,
        [title, genre, developer, release_date, description]
    );
}

exports.findGameByTitle = async (title) => {
    const { rows } = await pool.query('SELECT * FROM games WHERE title = $1', [title]);

    return rows[0];
}

exports.updateGameImage = async (array) => {
    for (const game of array) {

        await pool.query(`
            INSERT INTO games (game_img)
            SELECT $1
            WHERE NOT EXISTS (
                SELECT 1 FROM games
                WHERE game_img @> $1::jsonb
            );
        `, [game]);

        await pool.query(`
            UPDATE games
            SET game_img = $1::jsonb
            WHERE title = $2
            `, [game, game.name])
    }
}

exports.updateGame = async (gameData, gameTitle) => {
    const { title, genre, developer, release_date, description } = gameData;

    await pool.query(
        `UPDATES games 
        SET title = $1, genre = $2, developer = $3, release_date = $4, description = $5
        WHERE name = $6`,
        [title, genre, developer, release_date, description, gameTitle]
    );
}

exports.getGamesByCategory = async (categoryName) => {
    const { rows } = await pool.query(`
        SELECT games.*, categories.name AS category_name
        FROM games
        JOIN categories ON games.genre LIKE '%' || categories.name || '%'
        WHERE LOWER(categories.name) = LOWER($1)`, [categoryName]
    );

    return rows
}

exports.deleteGame = async (gameName) => {
    await pool.query('DELETE FROM games WHERE title = $1', [gameName]);
}