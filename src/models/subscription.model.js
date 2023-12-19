import mongoose, {Schema} from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjeccId, //one who is subscribing
        ref: 'User',
    },
    channel: {
        type: Schema.Types.ObjeccId, //to whom subscriber is subscribing (channel is also user)
        ref: 'User',
    }
}, {timestamps: true})

export const Subscription = mongoose.model('Subscription', subscriptionSchema)