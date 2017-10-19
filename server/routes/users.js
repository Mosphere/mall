var express = require('express');
var router = express.Router();
var User = require('./../models/users');
var Goods = require('./../models/goods');
require('./../util/dateFormat')
/* GET users listing. */
router.post('/login', function(req, res, next) {
    const loginInfo = req.body;
    User.findOne(loginInfo,function(err,doc){
      if(err){
        res.json({
          status: 100,
          msg: err.message
        });
      }else{
        if(doc){
          res.cookie('userId', doc.userId, { maxAge: 1000*60*60, httpOnly: true });
          res.cookie('userName', doc.userName, { maxAge: 1000*60*60, httpOnly: true });
          res.json({
            status: 200,
            msg: '登陆成功',
            result: {
              userName: doc.userName,
            }
          })
        }else{
          res.json({
            status: 101,
            msg: '账号或密码错误'
          })
        }
      }
    })
});

router.post('/addCart',function(req,res,next){
  const productId = req.body.pId;
  User.findOne({userId: req.cookies.userId},function(err,doc){
    if(err){
      res.json({
        status:0,
        msg:err.message
      })
    }else{
      if(doc){
        const cartList = doc.cartList;
        let goodsItem = '';
        cartList.every(function(item) {
          if(item.productId == productId){
            goodsItem = item;
            item.productNum++;
            return false;
          }
        });

        if(goodsItem){ //购物车中存在该商品
          doc.save(function(err1,doc1){
            if(err1){
              res.json({
                status:100,
                msg:"加入购物车失败"
              })
            }else{
              res.json({
                status:200,
                msg: `成功添加一件商品${goodsItem.productName}到购物车`,
                result:{
                  type: 201
                }
              })
            }
          })
        }else{//购物车中不存在该商品
          Goods.findOne({"productId":productId},function(err2,doc2){
            if(err2){
              res.json({
                status:101,
                msg:'该商品已下架'
              })
            }else{
              if(doc2){
                goodsToCart = {
                  "productImage": doc2.productImage,
                  "salePrice": doc2.salePrice,
                  "productName": doc2.productName,
                  "productId" : doc2.productId,
                  "productNum" : 1,
                  "checked" : true
                }
                doc2.productNum = 1;
                doc2.checked = true;
                doc.cartList.push(goodsToCart);
                doc.save(function(err3,doc3){
                  if(err3){
                    res.json({
                      status:103,
                      msg:'新增商品到购物车失败'
                    })
                  }else{
                    res.json({
                        status:200,
                        msg: `成功添加一件商品${doc2.productName}到购物车`,
                        result:{
                          doc: goodsToCart,
                          type: 202
                        }
                    })
                  }
                })
              }
              
            }
          })
        }
      }
    }
  })

});

router.get('/checkLogin',function(req,res,next){
  if(req.cookies && req.cookies.userId){
    res.json({
      status: 200,
      msg:"",
      result:{
        userName: req.cookies.userName
      }
    })
  }else{
    res.json({
      status: 0,
      msg: "未登录"
    })
  }
});

router.get('/getCartCount',function(req,res,next){
  User.findOne({"userId": req.cookies.userId},function(error,doc){
    if(error){
      res.json({
        status: 100,
        msg: error.message
      })
    }else{
      if(doc){
        const cartList = doc.cartList;
        let cartCount = 0;
        cartList.map(function(item){
          cartCount += parseInt(item.productNum);
        });
        res.json({
          status: 200,
          msg: '获取购物车数量成功',
          result: {
            cartCount: cartCount
          }
        })
      }
    }
  })
});

router.get('/logout',function(req,res,next){
  res.cookie('userId','', { maxAge: -1, httpOnly: true });
  res.cookie('userName','', { maxAge: -1, httpOnly: true });
  res.json({
    status:200,
    msg: "成功退出"
  })
});

/**
 * 获取购物车列表
 */
router.get('/cartList',function(req,res,next){
  User.findOne({userId: req.cookies.userId},function(error,doc){
    if(doc){
      res.json({
        status: 200,
        msg: '查询购物车列表成功',
        result: {
          cartList: doc.cartList
        }
      })
    }else{
      res.json({
        status:100,
        msg: error.message
      })
    }
  })
});

router.post('/cartDelete',function(req,res,next){
  const productId = req.body.pId;
  User.update({'userId': req.cookies.userId},{$pull: {'cartList':{'productId': productId}}},function(error,doc){
    if(error){
      res.json({
        status:100,
        msg: error.message
      })
    }else{
      res.json({
        status:200,
        msg:'移除成功',
      })
    }
  })
});

router.post('/cartEdit',function(req,res,next){
  const params = req.body;
  productId = params.p_id;
  productNum = params.p_num;
  checked = params.checked;
  User.update({"userId": req.cookies.userId,"cartList.productId": productId},{"cartList.$.productNum":productNum,"cartList.$.checked":checked},function(error,doc){
    if(error){
      res.json({
        status:100,
        msg: error.message
      })
    }else{
      res.json({
        status:200,
        msg:'编辑成功',
      })
    }
  })
});

router.post('/checkAll',function(req,res,next){
  const checked = req.body.checked;
  User.findOne({"userId": req.cookies.userId},function(error,user){
    if(error){
      res.json({
        status:100,
        msg: error.message
      })
    }else{
      if(user){
        let cartList = user.cartList;
        cartList.forEach((item)=>{
          item.checked = checked;
        })
        user.save(function(err,doc){
          if(err){
            res.json({
              status:100,
              msg: error.message
            })
          }else{
            res.json({
              status:200,
              msg:'全选成功',
            })
          }
        })
      }
    }
  }) 
});

/**
 * 获取收货地址列表
 */
router.get('/getAddressList',function(req,res,next){
  User.findOne({"userId": req.cookies.userId},function(error,doc){
    if(error){
      res.json({
        status: 100,
        msg: error.message
      })
    }else{
      if(doc){
        res.json({
          status: 200,
          msg: "获取地址列表成功",
          result:{
            addressList: doc.addressList
          }
        })
      }
    }
  })
});

/**
 * 删除收货地址
 */
router.post('/deleteAddress',function(req,res,next){
  const addressId = req.body.addressId;
  User.update({'userId': req.cookies.userId},{$pull: {'addressList':{'addressId': addressId}}},function(error,doc){
    if(error){
      res.json({
        status:100,
        msg: error.message
      })
    }else{
      res.json({
        status:200,
        msg:'删除收货地址成功',
      })
    }
  })
});

/**
 * 设置默认收货地址
 */
router.post('/setDefaultAddress',function(req,res,next){
  const addressId = req.body.addressId;
  User.findOne({"userId": req.cookies.userId},function(error,doc){
    if(error){
      res.json({
        status: 100,
        msg: error.message
      })
    }else{
      if(doc){
        const addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.addressId == addressId){
            item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        })
        doc.save(function(err,document){
          if(err){
            res.json({
              status: 100,
              msg: err.message
            })
          }else{
            res.json({
              status: 200,
              msg: "设置默认成功"
            })
          }
        })
      }
    }
  })
});

/**
 * 创建订单
 */
router.post('/createOrder',function(req,res,next){
  const addressId = req.body.addressId;
  const orderTotal = req.body.orderTotal;
  User.findOne({"userId": req.cookies.userId},function(error,document){
    if(error){
      res.json({
        status: 100,
        msg: error.message,
        result: ''
      });
    }else{
      if(document){
        let goodsList = []
        document.cartList.forEach((item)=>{
          if(item.checked){
            goodsList.push(item)
          }
        })

        let address = ''
        document.addressList.forEach((element)=>{
          if(element.addressId == addressId){
            address = element;
          }
        })

        const platform = '622';
        const r1 = Math.floor(Math.random()*10);
        const r2 = Math.floor(Math.random()*10);
        const sysTime = new Date().Format("yyyyMMddhhmmss");
        const orderId = platform + r1+ sysTime + r2;
        const createTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
        const orderData = {
          "orderId" : orderId,
          "orderTotal" : orderTotal,
          "orderStatus" : 1,
          "address": address,
          "createDate" : createTime,
          "goodsList" : goodsList
        }
        document.orderList.push(orderData);
        document.save(function(err,doc){
          if(err){
            res.json({
              status: 100,
              msg: err.message,
              result: '生成订单失败'
            });
          }else{
            if(doc){
              res.json({
                status: 200,
                msg: '生成订单成功',
                result: {
                  orderId: orderId,
                  orderTotal: orderTotal
                }
              });
            }
          }
        })
      }
    }
  })
  
})

module.exports = router;