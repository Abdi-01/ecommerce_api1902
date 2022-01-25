const { get } = require("express/lib/response");
const { db, dbQuery } = require("../config/database");

module.exports = {
    getProducts: async (req, res) => {
        try {
            // fungsi db query
            let filterQuery = [];

            for (let prop in req.query) {
                filterQuery.push(`${prop == "name" ? `p.${prop}` : prop}=${db.escape(req.query[prop])}`)
            }
            console.log("Before", filterQuery)
            console.log("After", filterQuery.join(" AND "))

            let getSql = `select p.*, b.name as brand_name, c.category from products p
                         join brand b on p.idbrand=b.idbrand
                         join category c on p.idcategory = c.idcategory ${filterQuery.length > 0 ? `WHERE ${filterQuery.join(" AND ")}` : ""};`

            console.log("After combine getSQL", getSql)
            let resultsProducts = await dbQuery(getSql);
            let resultsImages = await dbQuery(`Select * from images;`);
            let resultsStocks = await dbQuery(`Select * from stocks;`);

            resultsProducts.forEach((value, index) => {
                value.images = [];
                value.stocks = [];

                resultsImages.forEach(val => {
                    if (value.idproduct == val.idproduct) {
                        delete val.idproduct;
                        value.images.push(val)
                    }
                })
                resultsStocks.forEach(val => {
                    if (value.idproduct == val.idproduct) {
                        delete val.idproduct;
                        value.stocks.push(val)
                    }
                })
            })

            res.status(200).send({
                success: true,
                message: "Get Products Success ✅",
                dataProducts: resultsProducts,
                error: ""
            });

        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            });
        }
    }
}
// Cara 1
// getProducts: (req, res) => {
//     console.log("Middleware products")
//     // cara 1
//     // let getSql = "";
//     // if(req.query.id){
//     //     getSql = `select p.*, b.name as brand_name, c.category from products p
//     //     join brand b on p.idbrand=b.idbrand
//     //     join category c on p.idcategory = c.idcategory WHERE idproduct=${req.query.id};`
//     // }else{
//     //     getSql = `select p.*, b.name as brand_name, c.category from products p
//     //     join brand b on p.idbrand=b.idbrand
//     //     join category c on p.idcategory = c.idcategory;`
//     // }
//     // Cara 2
//     let getSql = `select p.*, b.name as brand_name, c.category from products p
//         join brand b on p.idbrand=b.idbrand
//         join category c on p.idcategory = c.idcategory ${req.query.id ? `WHERE idproduct=${req.query.id}` : ""};`

//     db.query(getSql, (err, results) => {
//         if (err) {
//             res.status(500).send({
//                 success: false,
//                 message: "Failed ❌",
//                 error: err
//             });
//         }

//         // get images product dari table images
//         let getImages = "Select * from images;"
//         db.query(getImages, (errImg, resultsImg) => {
//             if (err) {
//                 res.status(500).send({
//                     success: false,
//                     message: "Failed ❌",
//                     error: errImg
//                 });
//             }
//             results.forEach((value, idx) => {
//                 value.images = []; // tempat menyimpan data images yg idproductnya sesuai
//                 // cocokkan idproduct dari table products dengan table images
//                 //  results dengan resultsImg
//                 // kemudian idproduct yang sesuai akan masuk kedalam properti baru
//                 // dari results products
//                 resultsImg.forEach((val, index) => {
//                     if (value.idproduct == val.idproduct) {
//                         delete val.idproduct;
//                         value.images.push(val)
//                     }
//                 })
//             })

//             // get stock
//             db.query("Select * from stocks;", (errStck, resultsStck) => {
//                 if (errStck) {
//                     res.status(500).send({
//                         success: false,
//                         message: "Failed ❌",
//                         error: errStck
//                     });
//                 }
//                 results.forEach((value, idx) => {
//                     value.stocks = []; // tempat menyimpan data images yg idproductnya sesuai
//                     // cocokkan idproduct dari table products dengan table images
//                     //  results dengan resultsImg
//                     // kemudian idproduct yang sesuai akan masuk kedalam properti baru
//                     // dari results products
//                     resultsStck.forEach((val, index) => {
//                         if (value.idproduct == val.idproduct) {
//                             delete val.idproduct;
//                             value.stocks.push(val)
//                         }
//                     })
//                 })

//                 // get stock

//                 // looping untuk propertie stocks
//                 res.status(200).send({
//                     success: true,
//                     message: "Get Products Success ✅",
//                     dataProducts: results,
//                     error: ""
//                 });
//             })
//         })

//     })
// }