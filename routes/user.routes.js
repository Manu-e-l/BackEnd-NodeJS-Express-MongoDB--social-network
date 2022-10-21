const express = require('express');
// const { get } = require('mongoose');
const router = express.Router();

const multer = require("multer");
const upload = multer();

const authCtrl = require("../controllers/authCtrl");
const userCtrl = require("../controllers/userCtrl");
const uploadCtrl = require("../controllers/uploadCtrl")

// Import middleware
const middleware = require("../middleware/authMiddleware")

// Register User 
router.post('/register', authCtrl.signUp);

router.post("/login", authCtrl.signIn)
router.get("/logout", middleware.checkUserMiddleware, authCtrl.logout)

// Afficher tous les utilisateurs 
router.get("/", middleware.checkUserMiddleware, userCtrl.getUser);
// Affiche un User spécifique
router.get("/:id", middleware.checkUserMiddleware, userCtrl.ownUserInfo);
// Modifier User (Bio)
router.put("/:id", middleware.checkUserMiddleware, userCtrl.updateUser);
// Supprimer User
router.delete("/:id", middleware.checkUserMiddleware, userCtrl.deleteUser);
//.patch sert à intervenir à l'intérieur d'un array qui est dans notre éléments. Ici on met à jour le tableau présent dans la bdd pour le  nombre de follower 
router.patch("/follow/:id", middleware.checkUserMiddleware, userCtrl.followUser);
router.patch("/unfollow/:id", middleware.checkUserMiddleware, userCtrl.unfollowUser);

// Upload

router.post("/upload",upload.single('file') , uploadCtrl.uploadProfil)



module.exports = router;
