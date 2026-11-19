import {model, Schema} from 'mongoose';

const TeacherSchema = new Schema({
    fullName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    specialization:{
        type:String,
        required:true,
        trim:true
    },
    experience:{
        type:Number,
        required:true,
        trim:true

    }
},{
    timestamps: true
});

export const Teacher = model('Teacher',TeacherSchema)