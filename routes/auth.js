const router = require('express').Router();
const DB = require('../models/config');
const crypto = require('crypto');

function hashCreate(password) {
    const salt = crypto.randomBytes(32).toString('hex')
    const crypto_pwd = crypto.pbkdf2Sync(password, salt, 1, 32, 'sha512').toString('hex')
    const result = { "salt": salt, "pwd": crypto_pwd }
    return result
}

function hashCheck(salt, password) {
    const crypto_pwd = crypto.pbkdf2Sync(password, salt, 1, 32, 'sha512').toString('hex')
    return crypto_pwd
}

router.get('/login', (req, res) => res.render('login'));
router.post('/login', (req, res) => {
    const account = req.body;
    const email = account.user_email;
    const pwd = account.user_pwd;

    // login check
    let sql = 'SELECT count(*) as count, user_pwd, user_salt FROM user WHERE user_email=?';
    let params = [email];
    DB(sql, params).then((result) => {

        // return 
        if (!result.state) {
            console.log(result.err);
            res.send({ "result": "fail" });

        } else {
            let count = result.rows[0].count;
            if(!count){
                res.send({ "result": "fail" });

            } else {
                const user_pwd = result.rows[0].user_pwd;
                const user_salt = result.rows[0].user_salt;
    
                // 복호화
                const crypto_pwd = hashCheck(user_salt, pwd);
    
                if(user_pwd == crypto_pwd){
                    res.send({ "result": "ok" });
                } else {
                    res.send({ "result": "fail" });
                }
            }
            
        }
    })
});

router.get('/join', (req, res) => res.render('join'));
router.post('/join', (req, res) => {
    const account = req.body;
    const name = account.user_name;
    const email = account.user_email;
    const pwd = account.user_pwd;
    const tel = account.user_tel;

    // insert db
    console.log(account)

    // 암호화
    const hashed = hashCreate(pwd);

    const salt = hashed.salt;
    const crypto_pwd = hashed.pwd;

    let sql = 'INSERT INTO user (user_name, user_email, user_pwd, user_tel, user_salt) VALUES(?,?,?,?,?)';
    let params = [name, email, crypto_pwd, tel, salt];
    DB(sql, params).then(function (result) {

        // return 
        if (!result.state) {
            console.log(result.err);
            res.send({ "result": "fail" });
        } else {
            res.send({ "result": "ok" });
        }
    })
});

router.post('/email', (req, res) => {
    const account = req.body;
    const email = account.user_email;

    console.log(account)

    let sql = 'SELECT count(*) as count FROM user WHERE user_email = ?';
    let params = [email];
    DB(sql, params).then(function (result) {

        if (!result.state) {
            console.log(result.err);
            res.send({ "result": "fail" });

        } else {
            let count = result.rows[0].count;
            if (!count) {
                res.send({ "result": "ok" });
            } else {
                res.send({ "result": "fail" });
            }

        }
    })
});

module.exports = router;