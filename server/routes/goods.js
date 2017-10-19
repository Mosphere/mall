var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require ('./../models/goods');

mongoose.connect('mongodb://127.0.0.1:27017/mall').then(
    ()=>{
        console.log("connect success");
    },
    err=>{
        console.log(Error);
    }
);

router.get("/list",function(req,res,next){
    
    const params = req.query;
    const sort = {
        'salePrice':params.sort
    };
    const page = parseInt(params.page);
    const pageSize = parseInt(params.pageSize);
    const skip = (page-1)*pageSize;
    const priceLevel = params.priceLevel;
    let query = {};
    if(priceLevel!='All'){
        const startPrice = parseInt(params.startPrice);
        const endPrice = parseInt(params.endPrice);
        query = {'salePrice':{'$gt':startPrice,'$lte':endPrice}};
    }
    const goodsModel = Goods.find(query).skip(skip).limit(pageSize);
    goodsModel.sort(sort);
    goodsModel.exec(function(err,docs){
        if(err){
            res.json({
                status: 1,
                msg:err.message
            })
        }else{
            res.json({
                status: 0,
                msg: '',
                goods: {
                    count: docs.length,
                    list: docs
                }
            })
        }
    })
})

module.exports = router;