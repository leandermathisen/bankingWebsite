const express = require('express');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const User = require('./user.js');
const Account = require('./account.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var user = new User();

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
    res.render('index', {user: user});
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
    user.clear();
    res.render('index', {user: user});
});

app.get('/transfer', (req, res) => {
    console.log('Responding to transfer route');
    if (user.username != null) {
        connection.query('SELECT * FROM accounts WHERE username = ?', user.username, (err, result) => {
            if (err) throw err;
            user.accounts = [];
            for (let i = 0; i < result.length; i++) {
                var account = new Account(result[i].account_number, result[i].account_balance, result[i].account_type);
                user.accounts.push(account);
            }
            res.render('transfer', {user: user});
        });
    }
    else {
        res.render('index', {user: user});
    }
});

app.get('/balance', (req, res) => {
    console.log('Responding to balance route');
    if (user.username != null) {
        connection.query('SELECT * FROM accounts WHERE username = ?', user.username, (err, result) => {
            if (err) throw err;
            user.accounts = [];
            for (let i = 0; i < result.length; i++) {
                var account = new Account(result[i].account_number, result[i].account_balance, result[i].account_type);
                user.accounts.push(account);
            }
            res.render('balance', {user: user});
        });
    }
    else {
        res.render('index', {user: user});
    }
});

app.get('/users', (req, res) => {
    console.log('Responding to users route');
    connection.query('SELECT * FROM users', (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.get('/open_account', (req, res) => {
    console.log('Responding to open account route');
    res.render('open_account', {user: user});
});

app.post('/process_open_account', urlencodedParser, (req, res) => {
    var sql = 'INSERT INTO accounts (account_type, account_balance, username) VALUES (?, ?, ?)';
    connection.query(sql, [req.body.account_type, req.body.account_balance, user.username], (err, result) => {
        if (err) throw err;
        console.log('Successfully opened an account');
        res.render('index', {user: user});
    });
});

app.post('/process_login', urlencodedParser, (req, res) => {
    var sql = 'SELECT * FROM users WHERE username = ?';
    connection.query(sql, req.body.username, (err, result) => {
        if (err) throw err;
        if (result.length) {
            if (result[0].password = req.body.password) {
                console.log('Login successful');
                user.username = req.body.username;
                user.login = true;
                user.first_name = result[0].first_name;
                user.last_name = result[0].last_name;
                user.email = result[0].email;
                res.render('index', {user: user});
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
    var sql = 'INSERT INTO users (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [req.body.username, req.body.password, req.body.email, req.body.first_name, req.body.last_name], (err, result) => {
        if (err) throw err;
        user.username = req.body.username;
        user.login = true;
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.email = req.body.email;
        console.log('Sign up successful');
        res.render('index', {user: user});
    });

    
});

var server = app.listen(8081, () => {
    var host = server.address().address
    var port = server.address().port
    console.log('Server running at http://%s:%s', host, port);
});