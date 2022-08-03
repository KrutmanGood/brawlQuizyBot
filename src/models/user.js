import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true, 
    },
    username: {
        type: String,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    answeredQuestionsCount: {
        type: Number,
        default: 0,
    },
    answeredQuestions: {
        type: Array,
        default: [],
    },
    notifications: {
        type: Boolean,
    },
    isWithdraw: {
        type: Boolean,
        default: false,
    },
    isNotifications: {
        type: Boolean,
    }
})

const User = mongoose.model('User', userSchema)

export default User