const { db } = require('../config/database');
const Crypto = require('crypto'); // untuk enkripsi/hashing password

module.exports = {
    getData: (req, res, next) => {
        db.query(`Select username, email, role, status from users;`, (err, results) => {
            if (err) {
                res.status(500).send(err);
            };
            res.status(200).send(results);
        })
    },
    register: (req, res) => {
        let { username, password, email } = req.body
        let hashPassword = Crypto.createHmac("sha256", "budi").update(password).digest("hex");
        console.table({
            before: password,
            after: hashPassword
        });
        let insertSQL = `Insert into users (username,email,password) values 
        (${db.escape(username)}, ${db.escape(email)}, ${db.escape(hashPassword)});`

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
    },
    login: (req, res) => {
        let { email, password } = req.body
        let hashPassword = Crypto.createHmac("sha256", "budi").update(password).digest("hex");
        let loginScript = `Select * from users WHERE email=${db.escape(email)} AND password=${db.escape(hashPassword)};`;

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
                res.status(200).send({
                    success: true,
                    messages: "Login Success ✅",
                    data: results[0],
                    error:""
                })
            }else{
                res.status(401).send({
                    success: false,
                    messages: "Login Failed ❌",
                    data: {},
                    error:""
                })
            }
        })
    }
}