const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());

// DB Check Connection
const { db } = require("./config/database")
db.getConnection((err, connection) => {
    if (err) {
        console.log(`Error MySql Connection :`, err.message);
    }

    console.log(`Connected to MySql Server ✅ : ${connection.threadId}`)
})



// Routes API Setup
app.get('/', (req, res) => res.status(200).send("<h2>Welcome to ecommerce API</h2>"));

const { usersRoute } = require('./routes')

app.use('/users', usersRoute);

// config error handling
// app.use((err, req, res) => {
//     console.log("test", err)
// })

app.listen(PORT, () => console.log("Ecommerce API RUNNING :", PORT));