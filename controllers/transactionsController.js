const { dbQuery } = require("../config/database")

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

            let addSQL = await dbQuery(`insert into carts 
            value (null, ${req.dataUser.iduser}, ${req.body.idproduct}, ${req.body.idstock}, ${req.body.qty});`);

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
    }
}