const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");


const middleware = {
    checkUserMiddleware (req, res, next) {
        // S'il y a un cookie avec jwt, alors verify la clé, si err lui retirer le cookie sinon next() -> Routes
        const cookieTokeN = req.cookies.jwt;
        if (cookieTokeN) {
            jwt.verify(cookieTokeN, process.env.TOKEN_SECRET_KEY, async (err, data) => {
                if (err) {
                    // ( locals est une propriété qui est un{} contenant des variables locale lors de la demande/réponse client &server, on peut y "set" || ajouter 
                    // la propriété user. Si err alors user = null donc ce n'est pas un user puisqu'il n'a pas le token. Très utile avec res.render pour exposer notre back
                    // res.locals.user =  null,"lol, finalement le locals ne fonctionne pas";)
                    // On lui enlève son token,
                    res.cookie("jwt", "", { maxAge: 1 });
                    next()
                } else {
                    
                    // (data = contenu du token qu'on à crée, on y avait ajouté l'id de l'user. ici on la récup pour s'assurer de l'id de l'user 
                    // const userID = await UserModel.findById(data.id)
                    // locals est une propriété qui est un {} contenant des variables locale lors de la demande/réponse client &server, on peut y "set" || ajouter 
                    // la propriété user. Si good alors user = IdUser. Très utile avec res.render pour exposer notre back later
                    // res.locals.user = userID;)
                    // console.log(res.locals.user)
                    // console.log(userID)
                    // console.log(data.id)
                
                    next()
                }
            })
        } else {
            res.status(401).json({ message: "Veuillez-vous connecter ou vous inscrire." })
            
        }
    },

    logInMiddleware (req, res, next) {
        const cookieTokeN = req.cookies.jwt;
        console.log(cookieTokeN);
        if (cookieTokeN){
            jwt.verify(cookieTokeN, process.env.TOKEN_SECRET_KEY, async (err, data) => {
                if(err) {
                    console.log(err);

                }else{
                    console.log(data.userId)
                    next();

                }
            })

        }else{
            console.log('No Token Found')

        }

    }

    


}


module.exports = middleware;