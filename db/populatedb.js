const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255),
    genre VARCHAR(255),
    developer VARCHAR(255),
    release_date DATE
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255)
);

INSERT INTO games (title, genre, developer, release_date) 
    VALUES
    ('Terraria', 'Action-adventure sandbox', 'Re-Logic', '2011-05-16'),
    ('Hollow Knight', 'Metroidvania', 'Team Cherry', '2017-02-24'),
    ('Left 4 Dead 2', 'First-person shooter', 'Valve Corporation', '2009-11-17'),
    ('Oxygen Not Included', 'Simulation', 'Klei Entertainment', '2019-07-30'),
    ('The Long Dark', 'Survival', 'Hinterland Studio', '2017-08-01'),
    ('Subnautica', 'Survival', 'Unknown Worlds Entertainment', '2018-01-23'),
    ('Counter-Strike 2', 'First-person shooter', 'Valve Corporation', '2012-08-21'),

    ('Wolfenstein: The New Order', 'First-person shooter', 'MachineGames', '2014-05-20'),
    ('F.E.A.R. 2: Project Origin', 'First-person shooter', 'Monolith Productions', '2009-02-10'),
    ('Batman: Arkham City - Game of the Year Edition', 'Action-adventure', 'Rocksteady Studios', '2011-10-18'),
    ('SpeedRunners', 'Platformer', 'DoubleDutch Games', '2016-03-01');

INSERT INTO categories (name)
    VALUES
    ('Action'),
    ('Adventure'),
    ('Simulation'),
    ('Survival'),
    ('Platformer'),
    ('First-person shooter'),
    ('Metroidvania');
`;


const main = async () => {
    const client = new Client({
        connectionString: 'postgresql://postgres:005522@localhost:5432/inventory_application',
    })

    await client.connect();
    await client.query(SQL);
    await client.end();
}

main();