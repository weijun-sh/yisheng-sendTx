const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const hcCardOrdersSchema = new Schema(
  {
    _id: String,
    id: { type: Number, required: true },
    memberId: { type: Number, required: true },
    orderNo: { type: String, required: true },
    ctime: { type: Date, required: true },
    items: { type: Schema.Types.Mixed, required: true },
  }
);

exports.HcCardOrders = mongoose.model("hc_card_orders", hcCardOrdersSchema);
