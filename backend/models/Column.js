const mongoose = require('mongoose')
const {Schema } =require('mongoose')

const ColumnSchema= new Schema({
    name:{
        type: String,
        required: true,
    },
    board:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    order:{
        type: Number,
    }

})
module.exports=mongoose.model('Column', ColumnSchema)