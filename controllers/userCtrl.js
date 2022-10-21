const userModel = require("../models/userModel");

// Importer ObjectID, permet de vérifier que les paramétres existe dans la base de donnée cela permet d'use la methode ObjectID.isValid plus tard.
const ObjectID = require("mongoose").Types.ObjectId



// Changer cette syntaxe, si aucune plus-value

module.exports.getUser = async (req, res) => {
    const users = await userModel.find().select("-password");
    res.status(200).json(users);

};

module.exports.ownUserInfo = (req, res) => {
    console.log(req.params);
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send(`ID unknown : ${req.params.id}`)


    userModel.findById(req.params.id, (err, docs) => {
        if (!err) res.send(docs);
        else console.log(`ID unknown : ${err}`);
    }).select("-password");
};

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send(`ID unknown : ${req.params.id}`)

    try {
        await userModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: { bio: req.body.bio }
            },

            // Tout le temps mettre ces éléments quand il y a un input.
            { new: true, upsert: true, setDefaultsOnInsert: true }
            )

            .then((docs) => { return res.send(docs) })
            .catch((err) => { return res.status(500).send({ message: err }) })

    }



    catch (err) {
        return res.status(500).json({ message: err });
    }

};

module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send(`ID unknown : ${req.params.id}`)

    try {
        await userModel.remove({ _id: req.params.id }).exec();
        res.status(200).json({ message: "Succes deletes" })
    } catch (err) {
        return res.status(500).json({ message: err });

    }
};

module.exports.followUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToFollow))
        return res.status(400).send("ID unknown : " + req.params.id);


    // add to the follower list
    await userModel.findByIdAndUpdate(
        req.params.id,
        // $addtoSet = méthode tableau MongoDB, ajouter dans un array
        { $addToSet: { following: req.body.idToFollow } },
        { new: true, upsert: true }

    )
        .then((data) => res.send(data))
        .catch((err) => res.status(500).send({ message: err }))


    // add to following list
    await userModel.findByIdAndUpdate(
        req.body.idToFollow,
        // $addtoSet = méthode tableau MongoDB, ajouter dans un array
        { $addToSet: { followers: req.params.id } },
        { new: true, upsert: true }
    )
        // .then((data) => res.send(data))  IMPOSSIBLE de renvoyer deux RES donc erreur
        .catch((err) => res.status(500).send({ message: err }))

};

module.exports.unfollowUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToUnfollow))
        return res.status(400).send(`ID unknown : ${req.params.id}`)

    await userModel.findByIdAndUpdate(
        req.params.id,
        // $pull = méthode tableau MongoDB, retirer d'un array
        { $pull: { following: req.body.idToUnfollow } },
        { new: true, upsert: true }

    )
        .then((data) => res.send(data))
        .catch((err) => res.status(500).send({ message: err }))


    // add to following list
    await userModel.findByIdAndUpdate(
        req.body.idToUnfollow,
        // $pull = méthode tableau MongoDB, retirer d'un array
        { $pull: { followers: req.params.id } },
        { new: true, upsert: true }
    )
        // .then((data) => res.send(data))  IMPOSSIBLE de renvoyer deux RES donc erreur
        .catch((err) => res.status(500).send({ message: err }))

};



