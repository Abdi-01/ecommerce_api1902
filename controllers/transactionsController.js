const { dbQuery, db } = require("../config/database")

module.exports = {
    getCarts: async (req, res) => {
        try {

            let getSQL = await dbQuery(`Select c.*, p.name, b.brand, p.price, s.type, s.qty as stock_qty, p.price*c.qty as total_price, i.url from carts c 
            join products p on c.idproduct=p.idproduct
            join brand b on b.idbrand=p.idbrand
            join images i on p.idproduct=i.idproduct
            join stocks s on c.idstock=s.idstock where c.iduser=${req.dataUser.iduser} group by c.idcart;`)

            res.status(200).send({
                success: true,
                message: "Get Cart Success",
                list_data: getSQL,
                error: ""
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error
            })
        }
    },
    addToCart: async (req, res) => {
        try {

            // 1. get data cart berdasarkan logical AND pada SQL, 
            // yang dicocokkan adalah data iduser, idproduct, idstock
            // let getSQL = await dbQuery(`Select * from carts WHERE iduser=${req.dataUser.iduser} 
            // AND idproduct=${req.body.idproduct} AND idstock=${req.body.idstock};`)
            // if (getSQL.length == 0) {
            // 2. apabila ada results array kosong maka yang dilakukan adalah sql INSERT
            let addSQL = await dbQuery(`insert into carts 
               value (null, ${req.dataUser.iduser}, ${req.body.idproduct}, ${req.body.idstock}, ${req.body.qty});`);
            // } else {
            // 3. apabila ada results array memiliki data maka yang dilakukan adalah sql UPDATE
            //     let update = await dbQuery(`UPDATE carts SET qty=${req.body.qty} WHERE idcart=${req.params.id};`)
            // }

            res.status(200).send({
                success: true,
                message: "Add to cart success ✅",
                error: ""
            })

        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error
            })
        }
    },
    deleteCart: async (req, res) => {
        try {

            await dbQuery(`DELETE FROM carts where idcart=${req.params.id}`);

            res.status(200).send({
                success: true,
                message: "Delete cart success ✅",
                error: ""
            })

        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error
            })
        }
    },
    updateCart: async (req, res) => {
        try {

            await dbQuery(`UPDATE carts SET qty=${req.body.qty} WHERE idcart=${req.params.id};`)

            res.status(200).send({
                success: true,
                message: "Update cart success ✅",
                error: ""
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error
            })
        }
    },
    checkout: async (req, res) => {
        try {
            // 1. User mengirimkan data melalui req.body = invoice, date, total_price, ongkir,tax,note, detail:[isi dari data cart]
            console.log(req.dataUser)
            console.log(req.body)
            // 2. menjalankan sql INSERT untuk menambahkan data ke table transactions
            let insertTransaction = await dbQuery(`INSERT INTO transactions values (null, ${req.dataUser.iduser}
                , ${db.escape(req.body.invoice)}, NOW()
            , ${db.escape(req.body.total_price)}, ${db.escape(req.body.ongkir)}
            , ${db.escape(req.body.tax)}, ${db.escape(req.body.note)},'Unpaid');`)
            console.log(insertTransaction)
            // 3. jika berhasil, maka berikutnya kita harus menambahkan data dari detail
            //  kedalam table detail_transaction menggunakan sql INSERT (multiple insert)
            if (insertTransaction.insertId) {
                let generateInsert = req.body.detail.map(val => `(null, ${insertTransaction.insertId}, ${val.idproduct}, ${val.idstock}, ${val.qty},${val.total_price})`);

                let insertDetail = await dbQuery(`INSERT INTO detail_transactions values ${generateInsert.toString()};`)

                // 4. menghapus data pada cart
                let deleteCart = await dbQuery(`DELETE FROM carts where iduser=${req.dataUser.iduser};`);
                res.status(200).send({
                    success: true,
                    message: "Checkout success ✅",
                    error: ""
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error
            })
        }
    }
}