const sqlite3 = require('sqlite3').verbose();

// Otworzenie bazy danych
let db = new sqlite3.Database('./mainDataBase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Usuwanie danych z tabel
db.serialize(() => {
    db.run("DELETE FROM records", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Records table cleared.');
    });

    db.run("DELETE FROM owntexts", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Owntexts table cleared.');
    });

    db.run("DELETE FROM texts", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Texts table cleared.');
    });

    db.run("DELETE FROM lessons", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Lessons table cleared.');
    });

    db.run("DELETE FROM administrators", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Administrators table cleared.');
    });

    db.run("DELETE FROM users", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Users table cleared.');
    });

    // Usuwanie tabel
    db.run("DROP TABLE IF EXISTS records", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Records table dropped.');
    });

    db.run("DROP TABLE IF EXISTS owntexts", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Owntexts table dropped.');
    });

    db.run("DROP TABLE IF EXISTS texts", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Texts table dropped.');
    });

    db.run("DROP TABLE IF EXISTS lessons", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Lessons table dropped.');
    });

    db.run("DROP TABLE IF EXISTS administrators", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Administrators table dropped.');
    });

    db.run("DROP TABLE IF EXISTS users", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Users table dropped.');
    });
});

// Zamknięcie połączenia z bazą danych
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});
