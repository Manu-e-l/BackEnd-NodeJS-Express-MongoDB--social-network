const UserModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require ("bcrypt")
const multiplesErrors = require("../utils/errors.utils")
 
const maxAge = 3 * 24 * 60 * 60 * 1000 
// const createToken = (id) => {
//     return jwt.sign({id}), process.env.TOKEN_SECRET_KEY, {expiresIn : maxAge}
// }

const authCtrl = {

    signUp: async (req, res) => {
        const { pseudo, email, password } = req.body

        try {
            const user = await UserModel.create({ pseudo, email, password });
            res.status(201).json({ user: user._id })
        } catch (err) {
            console.log(err)
            const errors = multiplesErrors.signUpErrors(err);

            res.status(200).json({errors})
            
        }

    },

    signIn : (req,res) => {
        let { password, email } = req.body;
    // Trouvé l'utilisateur grâce à son mail dans la BDD
    UserModel.findOne({ email: email }, async (err, user) => {
        console.log(user)
      if (user == null) {
        res.status(404).json({
          message: "Aucun utilisateur trouvé veuillez-vous inscrire.",
        });
      } else {
        const match = await bcrypt.compare(password, user.password);

        if (match == true) {
    
              const token = jwt.sign(
                {
                  userId: user._id,
                },
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: maxAge }
              );
            console.log("Token crée")
    // Création Cookie : ("nomCookie", contentCookie (token), {options : httpOnly = uniquement sur notre serv, MaxAge = temps en milliseconde max }) 
    //  Le cookie justifie l'identité de l"utilisateur, puisqu'il abrite le token. 
          res.cookie("jwt", token, {httpOnly:true, maxAge: maxAge })
          res.json({ message: "Connecté", token: token });
        } else {
          res.status(404).json({ message: "Mot de passe incorrect" });
        }
      }
    });

    },
    
    
    // async (req,res) => {
    //     const { email, password } = req.body

    //     try {
    //         // Récup email & password dans user
    //         const user = await UserModel.login(email,password);
    //         const token = createToken(user._id)
    //         // Création Cookie : ("nomCookie", contentCookie (token), {options : httpOnly = uniquement sur notre serv, MaxAge = temps en milliseconde max })
    //         res.cookie("jwt", token, {httpOnly:true, maxAge: maxAge })
    //         res.status(200).json({user : user._id})
    //     }catch(err){
    //         res.status(200).json(err);

    //     }
    // },


    logout : (req,res) => {
    // En faisant, disparaitre le cookie "jwt" en 1 millisecondes, cela provoquera la déconnection puisque le jweb token ne sera plus présent
     // dans le cookie
        res.cookie("jwt", "", {maxAge : 1}).json({message : "Merci de votre visite, vous nous manquez déjà"});
    // redirection nécesasire pour postMan sinon pas d'aboutissement de la requête.
        // res.redirect('/') 

    }


}

module.exports = authCtrl