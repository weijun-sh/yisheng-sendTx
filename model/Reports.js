const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
      _id: String,
    id: { type: Number, required: true },
    memberId: { type: Number, required: true },
    yzContents: { type: String, required: true },
    reportTime: { type: Date, required: true },
    hxcode: { type: String, required: true }
  }
);

exports.Reports = mongoose.model("reports", reportSchema);
