const { db, dbQuery } = require('../config/database');
const Crypto = require('crypto'); // untuk enkripsi/hashing password
const { hashPassword, createToken } = require("../config/encrip");
const { transporter } = require('../config/nodemailer');

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
    register: async (req, res) => {
        try {
            let { username, password, email } = req.body;
            let insertSQL = `Insert into users (username,email,password) values 
            (${db.escape(username)}, ${db.escape(email)}, ${db.escape(hashPassword(password))});`;

            let getSQL = `Select * from users WHERE email=${db.escape(email)};`

            let checkEmail = await dbQuery(getSQL)
            if (checkEmail.length > 0) {
                res.status(400).send({
                    success: false,
                    message: "Email exist ⚠️",
                    error: ""
                });
            } else {
                let insertUser = await dbQuery(insertSQL);
                if (insertUser.insertId) {
                    // get data user berdasarkan insertId untuk dijadikan token
                    let getUser = `Select * from users where iduser=${insertUser.insertId};`
                    let { iduser, username, email, role, status } = getUser[0];
                    let token = createToken({ iduser, username, email, role, status })
                    // mengirimkan email yang berisi token untuk login
                    await transporter.sendMail({
                        from: "Admin Commerce",
                        to: "abdialghi@gmail.com",
                        subject: "Confirm Registration",
                        html: `<div>
                        <h3>Klik link dibawah ini untuk verifikasi akun anda</h3>
                        <a href='http://localhost:3000/verification/${token}'>Klik, Disini</a>
                        </div>`
                    })
                    res.status(200).send({
                        success: true,
                        message: "Register Success ✅",
                        error: ""
                    })
                }
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error
            });
        }
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
        if (req.dataUser.iduser) {
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
}