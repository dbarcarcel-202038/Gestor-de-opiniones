import {Schema, model} from 'mongoose'

const userSchema = Schema({
    name: {
        type: String,
        require: [true, "Name is required"]
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Username is required"]
    },
    email:{
        type: String,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        require: [true, "password is required"]
    }
},{
    versionKey: false
})

export default model('user', userSchema)