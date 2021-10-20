const {Person} = require("../model/Person");
const crypto = require('crypto');
const {sendTxRepeat} = require("./trxService");
const dayjs = require('dayjs')
const {HcCardOrders} = require("../model/HcCardOrders");
const {Reports} = require("../model/Reports");
const {MemberHcCards} = require("../model/MemberHcCards");
const fs = require("fs")
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

const bytes2HexString = (b)=> {
    // const buf = Buffer.from(b, 'ascii')
    // return buf.toString("hex")
    return b
    // return new Buffer(b).toString("base64"); ;
}
function parsePhones(udeskCustomerInfo){
    let phones = ''
    if(udeskCustomerInfo) {
        udeskCustomerInfo = JSON.parse(udeskCustomerInfo)
        phones = udeskCustomerInfo.cellphones.map(item => item.content).join(',')
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
async function tryAgain(callback,repeat){
    if(repeat>3){
        return
    }
    let $dfd = new Promise((resolve)=>{
        let time = Math.random()*60+30
        setTimeout(async ()=>{
            await callback()
            resolve()
        },time*1000);
    })
    return $dfd
}
async function parseOrder(order,index,repeat,e){
    let {id,memberId,orderNo,ctime,items} = order
    console.log(`query person ${memberId}`)
    let person = await Person.findOne({memberId})
    let time = "0";
    if(ctime && "null"!=ctime){
        time = dayjs(ctime).format("YYYY-MM-DD HH:mm:ss")
    }
    let cardType = parseItems(items)
    if(person) {
        let {sex, realname, birthday, udeskCustomerInfo} = person
        let phones = parsePhones(udeskCustomerInfo)
        let hashA = `${memberId}${sex}${realname}${birthday}${phones}${orderNo}${cardType}${time}`
        console.log(`rowHash-${hashA}`)
        hashA=hash(hashA)
        let name = hash(realname)
        phones = hash(parsePhones(udeskCustomerInfo))
        let params = `{"id":"${id}","table":"hc_card_orders", "memberId":"${memberId}","sex":"${sex}", "realname":"${name}", "birthday": "${birthday}","cellphones":"${phones}", "orderNo":"${orderNo}","cardType":"${cardType}", "ctime":"${time}", "hash":"${hashA}"}`
        params = bytes2HexString(params)
        // let params = `${memberId}|${sex}|${hash(realname)}|${birthday}|${hash(phones)}|${orderNo}|${names}|${time}|${rowHash}`
        try {
            let trxHash = await sendTxRepeat(params)
            fs.writeFileSync('./write.log', `${repeat}-${index}-${trxHash}-${params}-${e}\r\n`, {encoding: 'utf8', flag: 'a'}, err => {
            })
            console.log(`${trxHash}-${params}-${index}`)
        }catch (e){
            await tryAgain(()=>{
                parseOrder(order,index,++repeat,e)
            },repeat)
        }
    }else{
        fs.writeFileSync('./write.log',`not upload ${index}\r\n`, {encoding:'utf8',flag:'a'}, err => {})
        console.log(`not upload ${index}`)
    }
}
async function dealOrders(){
    let orders = await HcCardOrders.find()
    console.log(`orderSize:${orders.length}`)
    for(let index in orders){
        await parseOrder(orders[index],index,0)
    }
}
async function dealReport(report,index,repeat,e){
    const rowHash = calcRowHash(report);
    let {id,memberId,yzContents,reportTime,hxcode} = report
    const person = await Person.findOne({memberId})
    let time = "0";
    if(reportTime){
        time = dayjs(reportTime).format("YYYY-MM-DD HH:mm:ss")
    }
    if(person){
        let {sex,realname,birthday,udeskCustomerInfo} = person
        let phones = parsePhones(udeskCustomerInfo)
        let memberHcCards = await MemberHcCards.findOne({hxcode})
        if(memberHcCards){
            let {orderNo} = memberHcCards
            let order = await HcCardOrders.findOne({orderNo})
            if(order){
                let {items} = order
                let cardType = parseItems(items)
                yzContents = yzContents||''
                let rowHash = `${memberId}${sex}${realname}${birthday}${phones}${yzContents}${cardType}`
                console.log(`rowHash-${rowHash}`)
                rowHash=hash(rowHash)
                let name = hash(realname)
                let content = hash(yzContents)
                phones = hash(phones)
                let params = `{"id":"${id}","table":"reports","memberId":"${memberId}","sex":"${sex}","realname":"${realname}","birthday":"${birthday}","cellphones":"${phones}", "yzContents":"${content}","reportTime":"${time}","cardType":"${cardType}","hash":"${rowHash}"}`
                // const params = `${memberId}|${sex}|${hash(realname)}|${birthday}|${hash(phones)}|${hash(yzContents)}|${dayjs(reportTime).format("YYYY-MM-DD HH:mm:ss")}|${names}|${rowHash}`
                console.log(`previous-${params}`)
                params = bytes2HexString(params)
                console.log(`after-${params}`)
                try {
                    let trxHash = await sendTxRepeat(params)
                    fs.writeFileSync('./write-report.log', `${repeat}-${index}-${trxHash}-${params}-${e||''}\r\n`, {encoding: 'utf8', flag: 'a'}, err => {
                    })
                    console.log(`trx:${trxHash},params:${params}`)
                }catch (e){
                    fs.writeFileSync('./write-report.log', `error-${repeat}-${index}-${params}-${e||''}\r\n`, {encoding: 'utf8', flag: 'a'}, err => {
                    })
                    await tryAgain(()=>{
                        dealReport(report,index,++repeat,e)
                    },report)
                }
            }
        }
    }
}
async function dealReports(){
    let reports = await Reports.find();
    for(let key in reports){
        await  dealReport(reports[key],key,0)
    }
}
exports.dealOrders = dealOrders
exports.dealReports = dealReports
