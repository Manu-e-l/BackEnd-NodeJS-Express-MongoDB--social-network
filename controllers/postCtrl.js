const PostModel = require("../models/postModel");
const UserModel = require("../models/userModel");
const { uploadErrors } = require("../utils/errors.utils");
const fs = require("fs");
const { promisify } = require("util")
const pipeline = promisify(require("stream").pipeline);
// ObjectId vérifie à chaque fois que le paramétre rentré existe dans notre base de donnée
const ObjectID = require("mongoose").Types.ObjectId

const postCtrl = {
    readPost: (req, res) => {
        PostModel.find((err, docs) => {
            if (!err) {
                res.send(docs);
            } else {
                console.log(`Error to get data :${err}`)
            }
        }).sort({ createdAt: -1 })
        // .sort({ createdAt: -1}) affichera du plus récent au plus ancien.

    },

    createPost: async (req, res) => {
        let fileName = ""

        if (req.file !== null) {
            try {
                // Check le bon type de fichier 
                if (
                    req.file.detectedMimeType !== "image/jpg"
                    && req.file.detectedMimeType !== "image/png"
                    && req.file.detectedMimeType !== "image/jpeg")
                    throw Error("invalid file");

                // Check la taille limite en ko 
                if (req.file.size > 500000) throw Error("Max size");
            } catch (err) {
                //  import et use notre uploadErrors depuis notre fichier errors dans utils
                const errors = uploadErrors(err)

                return res.status(201).json({ errors });

            }

            fileName = req.body.posterId + Date.now() + '.jpg';

            await pipeline(
                req.file.stream,
                fs.createWriteStream(
                    `${__dirname}/../client/public/uploads/posts/${fileName}`
                )
            );
        }


        // Création variable newpost dans laquelle on incrémente un nouveau PostModel ou il y aura dedans un posterId, message etc etc ...
        const newPost = new PostModel({
            posterId: req.body.posterId,
            message: req.body.message,
            // ? = alors
            picture: req.file !== null ? "./uploads/posts/" + fileName : "",
            video: req.body.video,
            likers: [],
            comments: [],
        });

        try {
            const post = await newPost.save();
            return res.status(201).json(post);

        } catch (err) {
            return res.status(400).send(err);
        }

    },

    updatePost: (req, res) => {
        // C'est bien l'id du post qui est vérifier 
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send(`ID unknown : ${req.params.id}`)

        const updatedRecord = {
            message: req.body.message
        };
        PostModel.findByIdAndUpdate(
            req.params.id,
            { $set: updatedRecord },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.send(docs);
                } else {
                    console.log(`Update error : ${err}`);
                }
            });

    },

    deletePost: (req, res) => {
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send(`ID unknown : ${req.params.id}`);

        PostModel.findByIdAndRemove(
            req.params.id,
            (err, docs) => {
                if (!err) {
                    res.send(docs)
                } else {
                    console.log(`Delete error : ${err}`);
                }
            });

    },

    likePost: async (req, res) => {
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send(`ID unknown : ${req.params.id}`);

        try {
            await PostModel.findByIdAndUpdate(
                req.params.id,
                //{$addToSet} sert à ajouter une donnée en plus dans un array sans écraser les données précedentes. Ici on rajoute l'id de l'user qui like 
                { $addToSet: { likers: req.body.id } },
                { new: true },
            )

                .catch((err) => res.status(500).send({ message: err }));
            await UserModel.findByIdAndUpdate(
                req.body.id,
                { $addToSet: { likes: req.params.id } },
                { new: true },
            )
                .then((docs) => res.send(docs))
                .catch((err) => res.status(500).send({ message: err }));
        } catch (err) {
            return res.status(400).send(err);
        }

    },


    unlikePost: async (req, res) => {
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send(`ID unknown : ${req.params.id}`);

        try {
            await PostModel.findByIdAndUpdate(
                req.params.id,
                //{$addToSet} sert à ajouter une donnée en plus dans un array sans écraser les données précedentes. Ici on rajoute l'id de l'user qui like 
                { $pull: { likers: req.body.id } },
                { new: true },
            )

                .catch((err) => res.status(500).send({ message: err }));
            await UserModel.findByIdAndUpdate(
                req.body.id,
                { $pull: { likes: req.params.id } },
                { new: true },
            )
                .then((docs) => res.send(docs))
                .catch((err) => res.status(500).send({ message: err }))
        } catch (err) {
            return res.status(400).send(err);
        }
    },

    commentPost: (req, res) => {
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send(`ID unknown : ${req.params.id}`);

        try {
            return PostModel.findByIdAndUpdate(
                req.params.id,
                {
                    $push: {
                        comments: {
                            commenterId: req.body.commenterId,
                            commenterPseudo: req.body.commenterPseudo,
                            text: req.body.text,
                            timestamp: new Date().getTime()
                        }
                    }
                },
                { new: true }
            ).sort({ createdAt: -1 })
                .then((docs) => res.send(docs))
                .catch((err) => res.status(400).send({ message: err }))
        } catch (err) {
            return res.status(400).send(err);
        }

    },
    editCommentPost: (req, res) => {
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send(`ID unknown : ${req.params.id}`);

        try {
            return PostModel.findById(
                // trouve le Post grâce à son id du params
                req.params.id,
                // appel un callback, pour accéder à docs
                (err, docs) => {
                    // accéder à THE comment grâce à un find dans la docs , mettre une () avec un param "comment" puis comparé l'id "spé" du comment avec equals
                    const theComment = docs.comments.find((comment) =>
                        comment._id.equals(req.body.commentId)
                    )

                    if (!theComment) {
                        return res.status(404).send("Comment not found")
                    } else {
                        theComment.text = req.body.text
                        return docs.save((err) => {
                            if (!err) {
                                return res.status(200).send(docs)
                            } else {

                                return res.status(500).send(err);
                            }
                        })
                    }
                }
            );
        } catch (err) {
            return res.status(400).send(err);
        }
    },

    deleteCommentPost: (req, res) => {
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send(`ID unknown : ${req.params.id}`);

        try {
            return PostModel.findByIdAndUpdate(
                req.params.id,
                {
                    $pull: {
                        comments: {
                            _id: req.body.commentId
                        }
                    }
                },
                { new: true },

            )
                .then((docs) => res.send(docs))
                .catch((err) => res.status(400).send(err))
        } catch (err) {
            return res.status(400).send(err);
        }

    }


}

module.exports = postCtrl;