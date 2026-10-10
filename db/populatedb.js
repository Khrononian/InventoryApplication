const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255),
    genre VARCHAR(255),
    developer VARCHAR(255),
    release_date DATE
);

INSERT INTO games (title, genre, developer, release_date) 
    VALUES
    ('The Legend of Zelda: Breath of the Wild', 'Action-adventure', 'Nintendo', '2017-03-03'),
    ('God of War', 'Action-adventure', 'Santa Monica Studio', '2018-04-20'),
    ('Red Dead Redemption 2', 'Action-adventure', 'Rockstar Games', '2018-10-26'),
    ('Escape from Tarkov', 'First-person shooter', 'Battlestate Games', '2017-12-04'),
    ('Cyberpunk 2077', 'Action role-playing', 'CD Projekt Red', '2020-12-10'),
    ('Hollow Knight', 'Metroidvania', 'Team Cherry', '2017-02-24'),
    ('Dark Souls III', 'Action role-playing', 'FromSoftware', '2016-03-24'),
    ('Bloodborne', 'Action role-playing', 'FromSoftware', '2015-03-24');
    ('Back 4 Blood', 'First-person shooter', 'Turtle Rock Studios', '2021-10-12');
    ('Backrooms: The Game', 'Horror', 'Kinetic Games', '2023-03-01');
    ('Oxygen Not Included', 'Simulation', 'Klei Entertainment', '2019-07-30');
    ('Abiotic', 'Survival', 'Unknown Worlds Entertainment', '2021-05-20');
    ('The Long Dark', 'Survival', 'Hinterland Studio', '2017-08-01');
    ('Subnautica', 'Survival', 'Unknown Worlds Entertainment', '2018-01-23');
    ('Counter-Strike: Global Offensive', 'First-person shooter', 'Valve Corporation', '2012-08-21');


`;

const main = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:005522@localhost:5432/inventory_application',
    })

    await client.connect();
    await client.query(SQL);
    await client.end();
}

main();