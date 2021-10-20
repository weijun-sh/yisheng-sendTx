'use strict';
const mongoose = require('mongoose')
const { dealOrders, dealReports} = require("./service/dataService");
mongoose.connect('mongodb://readyisheng:read123456@47.242.157.159:27027/yisheng?authSource=yisheng')
const con = mongoose.connection;
con.on('error', console.error.bind(console, '连接数据库失败'));
con.once('open',async ()=>{
    console.log("connect success")
    // await dealOrders()
    await dealReports()
    //成功连接
})
