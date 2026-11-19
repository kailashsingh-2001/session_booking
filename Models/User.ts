import {Schema, model} from 'mongoose';

const UserSchema = new Schema(
    {
        fullName:{
            type:String,
            required:true,
            trim:true
        }  ,
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true
        },
        phone:{
            type:String,
            required:true,
            trim:true
        },
    },
   { timestamps:true }
    
);
export const User = model('User',UserSchema);