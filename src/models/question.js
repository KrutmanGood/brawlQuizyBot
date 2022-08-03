import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    file_id: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    questionId: {
        type: Number,
        required: true,
    },
    options: {
        type: Array,
        required: true,
    },
    isArchive: {
        type: Boolean,
        default: false,
    },
    isQuestion: {
        type: Boolean,
        default: true,
    }
})

const Question = mongoose.model('Question', questionSchema)

export default Question
