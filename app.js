'use strict';
const mongoose = require('mongoose')
const { dealOrders, dealReports} = require("./service/dataService");
mongoose.connect('mongodb://root:123456@localhost:27017/block?authSource=admin')
const con = mongoose.connection;
con.on('error', console.error.bind(console, '连接数据库失败'));
con.once('open',async ()=>{
    console.log("connect success")
    // await dealOrders()
    await dealReports()
    //成功连接
})
