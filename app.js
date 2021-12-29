const express = require('express');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var user = null;
var balance = null;
var login = false;

app.set('view engine', 'ejs');
app.use(express.static('views'));

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'banking'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to mysql database');
})

app.get('/', (req, res) => {
    console.log('Responding to root route');
    res.render('index', {login: login});
});

app.get('/signup', (req, res) => {
    console.log('Responding to sign up route');
    res.render('signup.ejs');
});

app.get('/login', (req, res) => {
    console.log('Responding to login route');
    res.render('login.ejs');
});

app.get('/logout', (req, res) => {
    console.log('Responding to logout route');
    user = null;
    balance = null;
    login = false;
    res.render('index', {login: login});
});

app.get('/transfer', (req, res) => {
    console.log('Responding to transfer route');
    if (user != null) {
        connection.query('SELECT balance FROM users WHERE username = ?', user, (err, result) => {
            if (err) throw err;
            balance = result[0].balance;
            res.render('transfer', {user: user, balance: balance});
        });
    }
    else {
        res.render('index', {login: login});
    }
});

app.get('/balance', (req, res) => {
    console.log('Responding to balance route');
    if (user != null) {
        connection.query('SELECT balance FROM users WHERE username = ?', user, (err, result) => {
            if (err) throw err;
            balance = result[0].balance;
            res.render('balance', {balance: balance});
        });
    }
    else {
        res.render('index', {login: login});
    }
});

app.get('/users', (req, res) => {
    console.log('Responding to users route');
    connection.query('SELECT * FROM users', (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/process_login', urlencodedParser, (req, res) => {
    var sql = 'SELECT * FROM users WHERE username = ?';
    connection.query(sql, req.body.username, (err, result) => {
        if (err) throw err;
        if (result.length) {
            if (result[0].password = req.body.password) {
                console.log('Login successful');
                user = req.body.username;
                login = true;
                res.render('index', {login: login});
            }
            else {
                console.log('Login unsuccessful incorrect password');
            }
        }
        else {
            console.log('Login unsuccessful username not found');
        }
    });  
});

app.post('/process_signup', urlencodedParser, (req, res) => {
    response = {
        username:req.body.username,
        password:req.body.password
    }

    console.log(response);
    res.render('index', {login: login});
});

var server = app.listen(8081, () => {
    var host = server.address().address
    var port = server.address().port
    console.log('Server running at http://%s:%s', host, port);
});