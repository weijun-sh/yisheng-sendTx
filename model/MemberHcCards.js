const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const memberHcCards = new Schema(
  {
    _id: String,
    id: { type: Number, required: true },
    memberId: { type: Number, required: true },
    orderNo: { type: String, required: true },
    hxCode: { type: String, required: true }
  }
);

exports.MemberHcCards = mongoose.model("member_hc_cards", memberHcCards);
