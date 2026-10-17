const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255),
    genre VARCHAR(255),
    developer VARCHAR(255),
    release_date DATE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255)
);

INSERT INTO games (title, genre, developer, release_date, description) 
    VALUES
    ('Terraria', 'Action-adventure sandbox', 'Re-Logic', '2011-05-16', 'A 2D sandbox adventure game'),
    ('Hollow Knight', 'Metroidvania', 'Team Cherry', '2017-02-24', 'A challenging 2D platformer'),
    ('Left 4 Dead 2', 'First-person shooter', 'Valve Corporation', '2009-11-17', 'A cooperative first-person shooter'),
    ('Cat Simulator', 'Simulation', 'Cat Simulator Inc.', '2020-01-01', 'A simulation game where you play as a cat'),
    ('The Long Dark', 'Survival', 'Hinterland Studio', '2017-08-01', 'A survival game set in the Canadian wilderness'),
    ('Subnautica', 'Survival', 'Unknown Worlds Entertainment', '2018-01-23', 'A survival game set in an alien ocean'),
    ('Counter-Strike 2', 'First-person shooter', 'Valve Corporation', '2012-08-21', 'A competitive first-person shooter'),

    ('Wolfenstein: The New Order', 'First-person shooter', 'MachineGames', '2014-05-20', 'A first-person shooter set in an alternate history'),
    ('F.E.A.R. 2: Project Origin', 'First-person shooter', 'Monolith Productions', '2009-02-10', 'A first-person shooter with supernatural elements'),
    ('Batman: Arkham City - Game of the Year Edition', 'Action-adventure', 'Rocksteady Studios', '2011-10-18', 'An action-adventure game based on the Batman comics'),
    ('SpeedRunners', 'Platformer', 'DoubleDutch Games', '2016-03-01', 'A fast-paced platformer game');

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