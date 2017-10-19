var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    "userId": String,
    "userName":String,
    "userPwd": String,
    "orderList":[
        {
            "orderId" : String,
            "orderTotal" : Number,
            "orderStatus" : Number,
            "address": String,
            "createDate" : String,
            "goodsList" : []
        }
    ],
    "cartList": [
        {
            "productImage": String,
            "salePrice": Number,
            "productName": String,
            "productId" : String,
            "productNum" : Number,
            "checked" : Boolean
        }
    ],
    "addressList":[
        {
          "addressId": String,
          "userName": String,
          "streetName": String,
          "postCode": Number,
          "tel": Number,
          "isDefault": Boolean
        }
    ]
});

module.exports = mongoose.model('users',userSchema,'users');