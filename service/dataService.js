const {Person} = require("../model/Person");
const crypto = require('crypto');
const {sendTxRepeat} = require("./trxService");
const dayjs = require('dayjs')
const {HcCardOrders} = require("../model/HcCardOrders");
const {Reports} = require("../model/Reports");
const {MemberHcCards} = require("../model/MemberHcCards");
function hash(data){
    const md5 = crypto.createHash('md5');
    md5.update(data)
    return md5.digest('hex');
}
function calcRowHash(row){
    let fields = []
    for(let key in row._doc){
        fields.push(row._doc[key])
    }
    const rowHash = `${hash(fields.join("|"))}`
    return rowHash
}
function parsePhones(udeskCustomerInfo){
    let phones = ''
    if(udeskCustomerInfo) {
        udeskCustomerInfo = JSON.parse(udeskCustomerInfo)
        udeskCustomerInfo.cellphones.map(item => item.content).join(',')
    }
    return phones
}

function parseItems(items){
    let names = '';
    if(items) {
        items = JSON.parse(items)
        names = items.map(item => item.name).join(',');
    }
    return names
}
async function parseOrder(order){
    let {id,memberId,orderNo,ctime,items} = order
    console.log(`query person ${memberId}`)
    let person = await Person.findOne({memberId})
    const rowHash = calcRowHash(order)
    let names = parseItems(items)
    if(person) {
        let {sex, realname, birthday, udeskCustomerInfo} = person
        let phones = parsePhones(udeskCustomerInfo)
        let params = `${memberId}|${sex}|${hash(realname)}|${birthday}|${hash(phones)}|${orderNo}|${dayjs(ctime).format("YYYY-MM-DD HH:mm:ss")}|${rowHash}`
        let trxHash = await sendTxRepeat(params)
        console.log(`${trxHash}-${params}`)
    }
}
async function dealOrders(){
    let orders = await HcCardOrders.find()
    console.log(`orderSize:${orders.length}`)
    for(let index in orders){
        await parseOrder(orders[index])
    }
}
async function dealReport(report){
    const rowHash = calcRowHash(report);
    let {id,memberId,yzContents,reportTime,hxcode} = report
    const person = await Person.findOne({memberId})
    if(person){
        let {sex,realname,birthday,udeskCustomerInfo} = person
        let phones = parsePhones(udeskCustomerInfo)
        let memberHcCards = await MemberHcCards.findOne({hxcode})
        if(memberHcCards){
            let {orderNo} = memberHcCards
            let order = await HcCardOrders.findOne({orderNo})
            if(order){
                let {items} = order
                let names = parseItems(items)
                yzContents = yzContents||''
                const params = `${memberId}|${sex}|${hash(realname)}|${birthday}|${hash(phones)}|${hash(yzContents)}|${dayjs(reportTime).format("YYYY-MM-DD HH:mm:ss")}|${names}|${rowHash}`
                let res = await sendTxRepeat(params)
                console.log(`trx:${res},params:${params}`)
            }
        }
    }
}
async function dealReports(){
    let reports = await Reports.find();
    for(let key in reports){
        await  dealReport(reports[key])
    }
}
exports.dealOrders = dealOrders
exports.dealReports = dealReports
