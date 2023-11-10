import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema  = new Schema(
    {
        username: {
            type : String,
            required: true,
            unique: true,
            trim: true,
            index: true,
            lowercase: true
        },
        email: {
            type : String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        fullname: {
            type : String,
            required: true,
            trim: true,
            index: true,
        },
        avatar:{
            type: String, //from Cloudinary.com
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        pasword: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        }
    }, 
    {
        timestamps: true,
    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username : this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCRESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCRESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generatRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);