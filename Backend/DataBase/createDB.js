const sqlite3 = require('sqlite3').verbose();

// Otworzenie bazy danych
let db = new sqlite3.Database('./mainDataBase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Tworzenie tabel
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        users_id INTEGER PRIMARY KEY AUTOINCREMENT,
        users_login VARCHAR UNIQUE,
        users_password VARCHAR
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS administrators (
        administrators_id INTEGER PRIMARY KEY AUTOINCREMENT,
        users_id INTEGER,
        FOREIGN KEY(users_id) REFERENCES users(users_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lessons (
        lessons_id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_name VARCHAR
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS texts (
        texts_id INTEGER PRIMARY KEY AUTOINCREMENT,
        lessons_id INTEGER,
        texts_name VARCHAR,
        texts_text VARCHAR,
        FOREIGN KEY(lessons_id) REFERENCES lessons(lessons_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS owntexts (
        owntexts_id INTEGER PRIMARY KEY AUTOINCREMENT,
        users_id INTEGER,
        owntexts_name VARCHAR,
        owntexts_text VARCHAR,
        FOREIGN KEY(users_id) REFERENCES users(users_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS records (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        texts_id INTEGER,
        users_id INTEGER,
        record_pkt INTEGER,
        FOREIGN KEY(texts_id) REFERENCES texts(texts_id),
        FOREIGN KEY(users_id) REFERENCES users(users_id)
    )`);
});

// Zamknięcie połączenia z bazą danych
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});