const UserModel = require("../models/userModel");
const fs = require("fs");
const { promisify } = require("util")
const pipeline = promisify(require("stream").pipeline);

const { uploadErrors } = require("../utils/errors.utils");



const uploadController = {
    uploadProfil: async (req, res) => {
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

        const fileName = req.body.name + ".jpg";

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/profil/${fileName}`
            )
        );

        try {
            await UserModel.findByIdAndUpdate(
                req.body.userId,
                { $set: { picture: `./uploads/profil/${fileName}` } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            )
                .then((docs) => res.send(docs))
                .catch((err) => res.status(500).json({ message: err }))

        } catch (err) {
            return res.status(500).json({ message: err })
        }

    }
}

module.exports = uploadController

