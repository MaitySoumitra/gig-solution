const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    role: { type: String, enum: ['super-admin','admin', 'Designer', 'Developer', 'Quality Testing', 'Bussiness Analyst'], required: true },
    phone: String,
    profilePicture: String,
    memberOfBoards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board"
    }],
    status: {
        type: String,
        default: null
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.generateJWT = function () {
    const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '3d' });
    return token;
};

module.exports = mongoose.model('User', userSchema);