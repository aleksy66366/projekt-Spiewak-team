const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

let db = new sqlite3.Database('./mainDataBase.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

db.serialize(() => {
    const adminPasswordHash = hashPassword('administrator');

    // Dodanie użytkownika administrator
    db.run(`INSERT INTO users (users_login, users_password) VALUES (?, ?)`, ['administrator', adminPasswordHash], function(err) {
        if (err) {
            return console.error(err.message);
        }
        const adminUserID = this.lastID;
        console.log(`Added administrator with ID: ${adminUserID}`);

        // Dodanie do tabeli administrators
        db.run(`INSERT INTO administrators (users_id) VALUES (?)`, [adminUserID], (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Administrator added to administrators table.`);

            // Dodanie lekcji
            db.run(`INSERT INTO lessons (lesson_name) VALUES (?)`, ['Lekcja 1'], function(err) {
                if (err) {
                    return console.error(err.message);
                }
                const lessonID = this.lastID;
                console.log(`Lesson 'Lekcja 1' added with ID: ${lessonID}`);

                // Dodanie tekstów
                const texts = [
                    { name: "Tekst 1", text: "To jest pierwszy tekst. Jest krótki i prosty." },
                    { name: "Tekst 2", text: "To jest drugi tekst. Ma kilka zdań więcej." }
                ];

                texts.forEach(text => {
                    db.run(`INSERT INTO texts (lessons_id, texts_name, texts_text) VALUES (?, ?, ?)`, [lessonID, text.name, text.text], function(err) {
                        if (err) {
                            return console.error(err.message);
                        }
                        console.log(`Text '${text.name}' added to lesson ID: ${lessonID}`);
                    });
                });

                // Dodanie własnego tekstu dla administratora
                db.run(`INSERT INTO owntexts (users_id, owntexts_name, owntexts_text) VALUES (?, ?, ?)`, [adminUserID, 'Mój własny tekst','Łąki, chabry, maczki, pole Nasze uśmiechy, łzy i niedole Ja uciekam, a ty stoisz Stracisz mnie – boisz się, czy nie boisz? Rumianek, łubin i dzikie róże, nadchodzą tęsknoty i chmury za duże. Uciekam i mknę przed tobą Choć wiem i czuję, że tyś mną a ja tobą.'], function(err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`Own text added for administrator.`);
                    db.close((err) => {
                        if (err) {
                            console.error(err.message);
                        }
                        console.log('Closed the database connection.');
                    });
                });
            });
        });
    });
});


