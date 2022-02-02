const { get } = require("express/lib/response");
const { db, dbQuery } = require("../config/database");
const Response = require("../config/handling");
const uploader = require("../config/uploader");

module.exports = {
    getBrands: async (req, res, next) => {
        try {
            let getBrands = await dbQuery(`Select * from brand;`)

            res.deliver = new Response(200, true, "Get Brand Success ✅", getBrands);
            next()
        } catch (error) {
            res.deliver = new Response(500, true, "Failed ❌", [], error);
            next()
        }
    },
    getCategory: async (req, res, next) => {
        try {
            let getCategory = await dbQuery(`Select * from category;`)

            res.deliver = new Response(200, false, "Get Category Success ✅", getCategory);
            next()
        } catch (error) {
            res.deliver = new Response(500, false, "Failed ❌", [], error);
            next()
        }
    },
    getProducts: async (req, res, next) => {
        try {
            // fungsi db query
            let filterQuery = [];

            for (let prop in req.query) {
                if (prop != "_sort" && prop != "_order") {
                    // cara 1 : price_min dan price_max harus diisi
                    // if (prop == "price_min") {
                    //     filterQuery.push(`price BETWEEN ${db.escape(req.query.price_min)} AND ${db.escape(req.query.price_max)}`)
                    // } else if(prop != "price_max"){
                    //     filterQuery.push(`${prop == "name" ? `p.${prop}` : prop}=${db.escape(req.query[prop])}`)
                    // }

                    // cara 2 : price_min atau price_max salah satu diisi atau keduanya diisi
                    if (prop == "price_min" || prop == "price_max") {
                        // console.log(prop,isNaN(parseInt(req.query[prop])))
                        if (req.query[prop]) {
                            filterQuery.push(`price ${prop == "price_min" ? '>' : '<'} ${db.escape(req.query[prop])}`)
                        }
                    } else {
                        filterQuery.push(`${prop == "name" ? `p.${prop}` : prop}=${db.escape(req.query[prop])}`)
                    }
                }
            }
            console.log("Before", filterQuery)
            console.log("After", filterQuery.join(" AND "))

            let { _sort, _order, status } = req.query

            let getSql = `select p.*, b.brand, c.category from products p
                         join brand b on p.idbrand=b.idbrand
                         join category c on p.idcategory = c.idcategory WHERE p.status=${status ? db.escape(status) : `'Active'`} 
                         ${filterQuery.length > 0 ? ` AND ${filterQuery.join(" AND ")}` : ""} 
                         ${_sort && _order ? `ORDER BY ${_sort} ${_order}` : ""};`

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

            // res.status(200).send({
            //     success: true,
            //     message: "Get Products Success ✅",
            //     dataProducts: resultsProducts,
            //     error: ""
            // });

            res.deliver = new Response(200, true, "Get Products Success ✅", resultsProducts);
            next()
        } catch (error) {
            res.deliver = new Response(500, false, "Failed ❌", [], error);
            next()
        }
    },
    addProduct: async (req, res) => {
        try {
            if (req.dataUser.role == "admin") {

                const uploadFile = uploader("/imgProducts", "IMGPRO").array("images", 5);

                uploadFile(req, res, async (error) => {
                    try {
                        // cek data yang dikirim front-end
                        console.log(req.body);
                        console.log("cek uploadfile :", req.files);

                        // proses simpan ke mysql
                        // untuk menyimpan data products, 
                        // table yang berpengaruh adalah table products, images, stocks
                        // console.log(req.body);
                        //         let { idbrand, idcategory, name, description, price, images, stocks } = req.body;

                        //         // console.log(`Insert into products values (null, ${db.escape(idbrand)}, ${db.escape(idcategory)}
                        //         // , ${db.escape(name)}, ${db.escape(description)}, ${db.escape(price)}, 'Active');`)
                        //         let insertProducts = await dbQuery(`Insert into products values (null, ${db.escape(idbrand)}, ${db.escape(idcategory)}
                        // , ${db.escape(name)}, ${db.escape(description)}, ${db.escape(price)}, 'Active');`)

                        //         if (insertProducts.insertId) {
                        //             // lanjut add data tables images dan juga stock
                        //             // add data ke table images
                        //             // let insertImages = await dbQuery ; digunakan jika membutuhkan results
                        //             // cara 1
                        //             for (let i = 0; i < images.length; i++) {
                        //                 await dbQuery(`Insert into images values (null, ${insertProducts.insertId}, ${db.escape(images[i])});`)
                        //             }

                        //             // cara 2
                        //             // images.forEach(val=>{
                        //             //     await dbQuery(`Insert into images values (null, ${insertProducts.insertId}, ${db.escape(val)});`)
                        //             // })

                        //             // cara 3
                        //             // await dbQuery(`Insert into images values ${images.map(val=>`(null, ${insertProducts.insertId}, ${db.escape(val)})`).toString()};`)

                        //             await dbQuery(`Insert into stocks values ${stocks.map(val => `(null, ${insertProducts.insertId}, ${db.escape(val.type)}, ${db.escape(val.qty)})`).toString()};`)

                        //             res.status(200).send({
                        //                 success: true,
                        //                 message: "Add product Success ✅"
                        //             })
                        //         }
                    } catch (error) {
                        // jika addproduct gagal, maka file akan dihapus
                        fs.unlinkSync(`./public/imgProducts/${req.files.images[0].filename}`)
                        res.status(500).send({
                            success: false,
                            message: "Failed ❌",
                            error: error
                        })
                    }
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "You can't access this API ⚠️"
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
    deleteProduct: async (req, res, next) => {
        try {
            if (req.dataUser.role == "admin") {

                await dbQuery(`Update products SET status='Deleted' WHERE idproduct=${req.params.id};`)

                res.deliver = new Response(200, true, "Delete Product Success ✅");
            } else {
                res.deliver = new Response(401, false, "You can't access this API ⚠️");
            }
            next()
        } catch (error) {
            res.deliver = new Response(500, false, "Failed ❌", [], error);
            next()
        }
    },
    updateProduct: async (req, res, next) => {
        try {
            if (req.dataUser.role == "admin") {
                console.log(req.body)
                let { idbrand, idcategory, name, description, price, status, images, stocks } = req.body
                // 1. update data untuk table products
                await dbQuery(`UPDATE products SET idbrand=${db.escape(idbrand)}, idcategory=${db.escape(idcategory)}, 
                name=${db.escape(name)}, description=${db.escape(description)}, price=${db.escape(price)} WHERE idproduct=${req.params.id};`);
                // 2. update data untuk table images
                images.forEach(async val => await dbQuery(`UPDATE images set url=${db.escape(val.url)} WHERE idimage=${val.idimage};`));

                // 3. update data untuk table stocks
                stocks.forEach(async val => await dbQuery(`UPDATE stocks set type=${db.escape(val.type)},qty=${db.escape(val.qty)} WHERE idstock=${val.idstock};`));

                // 4. mengirimkan response
                res.deliver = new Response(200, true, "Update Product Success ✅");
            } else {
                res.deliver = new Response(401, false, "You can't access this API ⚠️");
            }
            next()
        } catch (error) {
            res.deliver = new Response(500, false, "Failed ❌", [], error);
            next()
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