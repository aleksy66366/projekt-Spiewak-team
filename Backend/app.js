const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');


const app = express();

const port = 3000;
const dbPath = './DataBase/mainDataBase.db';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ustalenie katalogu, w którym znajdują się pliki HTML i CSS
const staticDir = path.join(__dirname, '../FrontEnd');
app.use(express.static(staticDir));

// Tworzenie połączenia z bazą danych
const db = new sqlite3.Database(dbPath);

// Ustawienia sesji
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function isAdmin(req, res, next) {
    console.log(req.session.isAdmin);
    if (req.session.isLoggedIn && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/');
    }
}

//tmp                                                                       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.use((req, res, next) => {
    req.session.userId = 1;
    next();
});


// ----------------------------------------------------
//                 Strona Główna
// ----------------------------------------------------
app.get('/', (req, res) => {
    const registerPath = path.join(staticDir, '/main.html');
    res.sendFile(registerPath);
});

// Endpoint do pobierania lekcji
app.get('/get-lessons', (req, res) => {
    const query = "SELECT lessons_id, lesson_name FROM lessons";

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint do pobierania tekstów dla danej lekcji
app.get('/get-texts-for-lesson/:lessonId', (req, res) => {
    const lessonId = req.params.lessonId;

    const query = "SELECT texts_id, texts_name FROM texts WHERE lessons_id = ?";

    db.all(query, [lessonId], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint do pobierania tekstu
app.get('/get-text/:textId', (req, res) => {
    const textId = req.params.textId;

    const query = "SELECT texts_text FROM texts WHERE texts_id = ?";

    db.all(query, [textId], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint do dodawania records
app.post('/add-record/:textId/:recordPts', (req, res) => {
    // Pobranie danych z żądania
    const textId = req.params.textId;
    const recordPts = req.params.recordPts;
    const userId = req.session.userId; 

    // Sprawdzenie, czy wszystkie wymagane dane są dostępne
    if (!textId || !recordPts || !userId) {
        res.status(400).send({ error: "Brak wymaganych danych: textId, recordPts lub userId" });
        return;
    }

    // Zapytanie SQL do dodania rekordu
    const query = "INSERT INTO records (texts_id, users_id, record_pkt) VALUES (?, ?, ?)";

    db.run(query, [textId, userId, recordPts], (err) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ message: "Rekord dodany pomyślnie" });
    });
});

// Endpoint do pobierania top 100 graczy
app.get('/top-records/:textId', (req, res) => {
    const textId = req.params.textId;

    const query = "SELECT * FROM records WHERE texts_id = ? ORDER BY record_pkt DESC LIMIT 100";

    db.all(query, [textId], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint zwracający id usera
app.get('/get-user-by-id/:userId', (req, res) => {
    const userId = req.params.userId; // Używaj 'userId', a nie 'lessonId'

    const query = "SELECT users_login FROM users WHERE users_id = ?";
    db.get(query, [userId], (err, row) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).send({ message: "User not found" }); // Zmieniłem komunikat na bardziej precyzyjny
        }
    });
});

// ----------------------------------------------------
//                 Własny text
// ----------------------------------------------------
app.get('/My-Custom-Text', (req, res) => {
    const registerPath = path.join(staticDir, '../Frontend/myown.html');
    res.sendFile(registerPath);
});

// Endpoint do pobierania tekstów usera
app.get('/get-texts-for-user', (req, res) => {
    const userId = req.session.userId; 

    const query = "SELECT owntexts_id, owntexts_name FROM owntexts WHERE users_id = ?";

    db.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint do pobierania konkretnego tekstu usera
app.get('/get-owntext/:owntextId', (req, res) => {
    const owntextId = req.params.owntextId;

    const query = "SELECT owntexts_text FROM owntexts WHERE owntexts_id = ?";

    db.all(query, [owntextId], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint do dodawania własnego tekstu dla usera
app.post('/add-owntext', (req, res) => {
    // Pobranie danych z żądania
    const userId = req.session.userId; 
    const owntexttitle = req.body.textTitleToAddForOwn;
    const owntext = req.body.textToAddForOwn;

    //sprawdzanie poprawności danych
    if (!userId || !owntexttitle || !owntext) {
        res.status(400).send({ error: "Brak wymaganych danych: userId, owntexttitle lub owntext" });
        return;
    }

    // Zapytanie SQL do dodania rekordu
    const query = "INSERT INTO owntexts (users_id, owntexts_name, owntexts_text) VALUES (?, ?, ?)";

    db.run(query, [userId, owntexttitle, owntext], (err) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ message: "Rekord dodany pomyślnie" });
    });
});

// Endpoint do usunięcia własnego tekstu dla usera
app.post('/delete-owntext/:owntexts_id', (req, res) => {
    const owntextsId = req.params.owntexts_id;

    if (!owntextsId) {
        res.status(400).send({ error: "Brak wymaganego owntexts_id" });
        return;
    }

    const query = "DELETE FROM owntexts WHERE owntexts_id = ?";

    db.run(query, [owntextsId], (err) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ message: "Rekord usunięty pomyślnie" });
    });
});

// Endpoint do edycji własnego tekstu dla usera
app.post('/edit-owntext/:owntexts_id', (req, res) => {
    const owntextsId = req.params.owntexts_id;
    const userId = req.session.userId;
    const owntexttitle = req.body.textTitleToAddForOwn;
    const owntext = req.body.textToAddForOwn;

    // Sprawdzenie, czy wszystkie wymagane dane są dostępne
    if (!userId || !owntexttitle || !owntext) {
        res.status(400).send({ error: "Brak wymaganych danych: userId, owntexttitle lub owntext" });
        return;
    }

    // Zapytanie SQL do aktualizacji rekordu
    const query = "UPDATE owntexts SET owntexts_name = ?, owntexts_text = ? WHERE owntexts_id = ? AND users_id = ?";

    db.run(query, [owntexttitle, owntext, owntextsId, userId], (err) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ message: "Rekord zaktualizowany pomyślnie" });
    });
});

//tmp                                                                       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get('/Test-My-Custom-Text', (req, res) => {
    const registerPath = path.join(staticDir, '../Backend/Tests/test-owntext.html');
    res.sendFile(registerPath);
});

// ----------------------------------------------------
//                 Edycja administratorów             |tylko dla admin
// ----------------------------------------------------
app.get('/users', isAdmin,(req, res) => {
    const registerPath = path.join(staticDir, '../Frontend/users.html');
    res.sendFile(registerPath);
});

//tmp                                                                       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get('/Test-users', isAdmin, (req, res) => {
    const registerPath = path.join(staticDir, '../../Backend/Tests/test-users.html');
    res.sendFile(registerPath);
});

//endpoint do wyświetlenia użytkowników niebędących administratorami
app.get('/non-admin-users', isAdmin, (req, res) => {
    const query = `
        SELECT u.users_id, u.users_login
        FROM users u
        LEFT JOIN administrators a ON u.users_id = a.users_id
        WHERE a.users_id IS NULL`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

//ustaw użytkownika jako administratora
app.get('/add-admin/:userId', isAdmin, (req, res) => {
    const userId = req.params.userId;

    const query = "INSERT INTO administrators (users_id) VALUES (?)";

    db.run(query, [userId], (err) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ message: "Użytkownik ustawiony jako administrator" });
    });
});

// ----------------------------------------------------
//                     Logowanie            
// ----------------------------------------------------
//tmp                                                                       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get('/Test-login', (req, res) => {
    const registerPath = path.join(staticDir, '../../Backend/Tests/test-login.html');
    res.sendFile(registerPath);
});
app.get('/login', (req, res) => {
    const loginPath = path.join(staticDir, 'login.html');
    res.sendFile(loginPath);
});

//endpoint obsługujący logowanie
app.post('/try-login', (req, res) => {
    // Sprawdzenie, czy użytkownik jest już zalogowany
    if (req.session.isLoggedIn) {
        res.redirect('/');
        return;
    }

    // Sprawdzenie danych logowania
    let username = req.body.login;
    let password = req.body.password;
    password = hashPassword(password);

    // Zapytanie do bazy danych, aby znaleźć użytkownika
    const query = "SELECT users_id, users_password FROM users WHERE users_login = ?";

    db.get(query, [username], (err, user) => {
        if (err) { 
            // Obsługa błędu w przypadku niepowodzenia zapytania
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        if (user && user.users_password === password) {
            console.log('zalogowano');
            req.session.isLoggedIn = true;
            req.session.loggedUserId = user.users_id;

            const adminQuery = "SELECT * FROM administrators WHERE users_id = ?";
            db.get(adminQuery, [user.users_id], (err, adminRow) => {
                if (adminRow) {
                    console.log('jako administrator');
                    req.session.isAdmin = true;
                } else {
                    req.session.isAdmin = false;
                }
                // Przekierowanie po ustaleniu statusu administratora
                res.redirect('/');
            });
        } else {
            if (!user) {
                res.redirect('/login?error=noUser');
            } else {
                res.redirect('/login?error=invalidCredentials');
            }
        }
    });
});

// ----------------------------------------------------
//                     Wylogowanie            
// ----------------------------------------------------
app.get('/logout', (req, res) => {
    if (req.session) {
        // Usunięcie informacji o zalogowanym użytkowniku
        req.session.isLoggedIn = false;
        req.session.loggedUserId = null;

        // Możesz również zakończyć sesję używając req.session.destroy()
        // req.session.destroy((err) => {
        //     if(err) {
        //         return console.log(err);
        //     }
        // });

        res.redirect('/'); // Przekierowanie na stronę logowania
    }
});

// ----------------------------------------------------
//                     Rejestracja            
// ----------------------------------------------------
//tmp                                                                       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get('/Test-register', (req, res) => {
    const registerPath = path.join(staticDir, '../Backend/Tests/test-register.html');
    res.sendFile(registerPath);
});
app.get('/register', (req, res) => {
    const loginPath = path.join(staticDir, 'register.html');
    res.sendFile(loginPath);
});

//endpoint do sprawdzenia loginu rejestrowania
app.get('/test-username/:username', (req, res) => {
    const username = req.params.username;

    const query = "SELECT COUNT(*) AS count FROM users WHERE users_login = ?";

    db.get(query, [username], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (row.count > 0) {
            res.send({ available: false });
        } else {
            res.send({ available: true });
        }
    });
});

//endpoint do rejestrowania !po sprawdzeniu cza hasło = hasło i poprzedniego posta
app.post('/try-register', (req, res) => {
    const username = req.body.login;
    let password = req.body.password;
    password = hashPassword(password);

    const query = "INSERT INTO users (users_login, users_password) VALUES (?, ?)";

    db.run(query, [username, password], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.redirect('/login'); // Przekierowanie na stronę logowania
    });
});

// ----------------------------------------------------
//              Admin dla lekcje i text                |tylko dla admin
// ----------------------------------------------------
//tmp                                                                       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get('/Test-editLessons', isAdmin, (req, res) => {
    const registerPath = path.join(staticDir, '../Backend/Tests/test-editlessons.html');
    res.sendFile(registerPath);
});
app.get('/editLessons', isAdmin, (req, res) => {
    const loginPath = path.join(staticDir, 'editlessons.html');
    res.sendFile(loginPath);
});

//endpoint zwracający wszystkie lekcje !inny niż tamten z get-lessons
app.get('/all-lessons', isAdmin, (req, res) => {
    const query = "SELECT lessons_id, lesson_name FROM lessons";

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(rows);
    });
});

//endpoint zwracający wybraną lekcje !inny niż tamten z get-lessons
app.get('/get-lesson/:lessonId', isAdmin, (req, res) => {
    const lessonId = req.params.lessonId;

    const query = "SELECT lesson_name FROM lessons WHERE lessons_id = ?";
    db.get(query, [lessonId], (err, row) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).send({ message: "Lekcja nie znaleziona." });
        }
    });
});

//endpoint usuwający lekcje o danym id
app.get('/delete-lesson/:lessonId', isAdmin, (req, res) => {
    const lessonId = req.params.lessonId;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");

        const deleteTexts = "DELETE FROM texts WHERE lessons_id = ?";
        db.run(deleteTexts, [lessonId], (err) => {
            if (err) {
                console.error(err.message);
                db.run("ROLLBACK;");
                res.status(500).send('Internal Server Error');
                return;
            }

            const deleteLesson = "DELETE FROM lessons WHERE lessons_id = ?";
            db.run(deleteLesson, [lessonId], (err) => {
                if (err) {
                    console.error(err.message);
                    db.run("ROLLBACK;");
                    res.status(500).send('Internal Server Error');
                } else {
                    db.run("COMMIT;");
                    res.send("Lekcja i powiązane z nią teksty zostały usunięte.");
                }
            });
        });
    });
});

//endpoint edytujący lekcje o danym id
app.post('/edit-lesson/:lessonId', isAdmin, (req, res) => {
    const lessonId = req.params.lessonId;
    let newTitle = req.body.lessonTitle;

    if (!newTitle) {
        res.status(400).send("Nie podano nowego tytułu.");
        return;
    }

    const query = "UPDATE lessons SET lesson_name = ? WHERE lessons_id = ?";

    db.run(query, [newTitle, lessonId], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send("Tytuł lekcji został zaktualizowany.");
    });
});

//endpoint dodający lekcje o danym id
app.post('/add-lesson', isAdmin, (req, res) => {
    let lessonTitle = req.body.lessonTitle;

    if (!lessonTitle) {
        res.status(400).send("Nie podano tytułu lekcji.");
        return;
    }

    const query = "INSERT INTO lessons (lesson_name) VALUES (?)";

    db.run(query, [lessonTitle], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send({ message: "Lekcja została dodana.", lessonId: this.lastID });
    });
});

// Endpoint do pobierania tekstów dla danej lekcji !inny niż poprzedniu
app.get('/all-texts/:lessonId', isAdmin, (req, res) => {
    const lessonId = req.params.lessonId;

    const query = "SELECT texts_id, texts_name FROM texts WHERE lessons_id = ?";

    db.all(query, [lessonId], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint do pobierania tekstów dla danej lekcji !inny niż poprzedniu
app.get('/get-texts/:textId', isAdmin, (req, res) => {
    const textId = req.params.textId;

    const query = "SELECT texts_name, texts_text FROM texts WHERE texts_id = ?";

    db.all(query, [textId], (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

//endpoint usuwający text o danym id
app.get('/delete-text/:textId', isAdmin, (req, res) => {
    const textId = req.params.textId;

    if (!textId) {
        res.status(400).send("Nie podano ID tekstu.");
        return;
    }

    const query = "DELETE FROM texts WHERE texts_id = ?";

    db.run(query, [textId], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send({ message: "Tekst usunięty pomyślnie" });
    });
});

//endpoint edytujący text o danym id
app.post('/edit-text/:textId', isAdmin, (req, res) => {
    const textId = req.params.textId;
    const newTextTitle = req.body.TextTitle;
    const newText = req.body.text;

    if (!textId || !newTextTitle || !newText) {
        res.status(400).send("Brak wymaganych danych: textId, TextTitle lub text");
        return;
    }

    const query = "UPDATE texts SET texts_name = ?, texts_text = ? WHERE texts_id = ?";

    db.run(query, [newTextTitle, newText, textId], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send({ message: "Tekst zaktualizowany pomyślnie" });
    });
});

//endpoint dodający lekcje o danym id
app.post('/add-text/:lessonId', isAdmin, (req, res) => {
    const lessonId = req.params.lessonId;
    const newTextTitle = req.body.TextTitle;
    const newText = req.body.text;

    if (!lessonId || !newTextTitle || !newText) {
        res.status(400).send("Brak wymaganych danych: lessonId, TextTitle lub text");
        return;
    }

    const query = "INSERT INTO texts (lessons_id, texts_name, texts_text) VALUES (?, ?, ?)";

    db.run(query, [lessonId, newTextTitle, newText], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(200).send({ message: "Tekst dodany pomyślnie" });
    });
});


// ----------------------------------------------------
//                 Czy (login admin)           
// ----------------------------------------------------
app.get('/user-status', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    const isAdmin = req.session.isAdmin || false;

    res.json({ isLoggedIn, isAdmin });
});

//-----_____-----______-----_____-----_____-----_____-----_____-----
// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});