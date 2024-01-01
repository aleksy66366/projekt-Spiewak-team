const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

const port = 3000;
const dbPath = './DataBase/mainDataBase.db';
