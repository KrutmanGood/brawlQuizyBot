import mongoose from 'mongoose'

const countSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        default: true,
    }
})

const Count = mongoose.model('Count', countSchema)

export default Count