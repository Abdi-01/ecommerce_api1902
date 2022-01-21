const { db } = require('../config/database');
const Crypto = require('crypto'); // untuk enkripsi/hashing password
const { hashPassword, createToken } = require("../config/encrip")

module.exports = {
    getData: (req, res, next) => {
        db.query(`Select username, email, role, status from users;`, (err, results) => {
            if (err) {
                // res.status(500).send(err);
                req.resMiddleware = {
                    success: false,
                    message: "Failed ❌",
                    error: err.message
                }
                next()
            };
            res.status(200).send(results);
        })
    },
    register: (req, res) => {
        let { username, password, email } = req.body;
        // console.table({
        //     before: password,
        //     after: hashPassword
        // });
        let insertSQL = `Insert into users (username,email,password) values 
        (${db.escape(username)}, ${db.escape(email)}, ${db.escape(hashPassword(password))});`;

        let getSQL = `Select * from users WHERE email=${db.escape(email)};`

        db.query(getSQL, (errGet, resultsGet) => {
            if (errGet) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: errGet
                });
            };

            if (resultsGet.length > 0) {
                res.status(400).send({
                    success: false,
                    message: "Email exist ⚠️",
                    error: ""
                });
            } else {
                db.query(insertSQL, (err, results) => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            message: "Failed ❌",
                            error: err
                        });
                    };
                    res.status(200).send({
                        success: true,
                        message: "Register success ✅",
                        error: ""
                    });
                })
            }
        })


    },
    login: (req, res) => {
        let { email, password } = req.body
        let loginScript = `Select * from users WHERE email=${db.escape(email)} AND password=${db.escape(hashPassword(password))};`;

        db.query(loginScript, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: err
                });
            };

            if (results.length > 0) {
                let { iduser, username, email, role, status } = results[0]
                let token = createToken({ iduser, username, email, role, status })
                res.status(200).send({
                    success: true,
                    messages: "Login Success ✅",
                    dataLogin: { username, email, role, status, token },
                    error: ""
                })
            } else {
                res.status(401).send({
                    success: false,
                    messages: "Login Failed ❌",
                    dataLogin: {},
                    error: ""
                })
            }
        })
    },
    keepLogin: (req, res) => {
        console.log(req.dataUser)
        let loginScript = `Select * from users WHERE iduser=${db.escape(req.dataUser.iduser)};`;

        db.query(loginScript, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: err
                });
            };

            if (results.length > 0) {
                let { iduser, username, email, password, role, status } = results[0]
                let token = createToken({ iduser, username, email, role, status });
                res.status(200).send({
                    success: true,
                    messages: "Login Success ✅",
                    dataLogin: { username, email, role, status, token },
                    error: ""
                })
            } else {
                res.status(401).send({
                    success: false,
                    messages: "Login Failed ❌",
                    dataLogin: {},
                    error: ""
                })
            }
        })
    }
}