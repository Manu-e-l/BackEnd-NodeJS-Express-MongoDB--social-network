const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema(
    {
        posterId: {
            type: String,
            required: true
        },
        message: {
            type: String,
            trim: true,
            maxlength: 533,

        },
        picture: {
            type: String,
        },

        video: {
            type: String,
        },
        likers: {
            type: [String],
        // [String] veut dire un array avec des strings dedans
            required: true,
        },
        comments : {
            type: [
                {
                    commenterId:String,
                    commenterPseudo: String,
                    text: String,
                    timestamp: Number,
                }
            ],
            required: true,
            // required : true   permet d'avoir l'array crée de base
        }


},
{
    timestamps: true,
}
);

module.exports = mongoose.model('post', PostSchema)