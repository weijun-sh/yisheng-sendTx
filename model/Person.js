const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const personSchema = new Schema(
  {
    _id: String,
    id: { type: Number, required: true },
    memberId: { type: String, required: true },
    sex: { type: Number, required: true },
    realname: { type: String, required: true },
    birthday: { type: String, required: true },
    udeskCustomerInfo: { type: Schema.Types.Mixed, required: true },
  }
);
exports.Person= mongoose.model("jj_persons", personSchema);
