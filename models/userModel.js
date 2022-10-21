const mongoose = require("mongoose");

// Vérif email en appelant la fonction "isEmail"
const { isEmail } = require("validator");
// crypt password
const bcrypt = require("bcrypt");


const UserSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 55,
      unique: true,
      // trim = supprime les espaces
      trim: true
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail],
      // lowercase = miniscule 
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      max: 1024,
      minlength: 6
    },
    picture: {
      // Stocker l'image dans un dossier static. Type = String à cause du chemin
      type: String,
      default: "./uploads/profil/random-user.png"
    },
    bio: {
      type: String,
      max: 1024,
    },
    followers: {
      // [String] = un Array qui abrite des strings. Utile pour stocker les données des personnes qui follow 
      type: [String]
    },
    following: {
      type: [String]
    },
    likes: {
      // Utile pour stocker les publi déja likés, mettre id post dans l'array. Évite les likes infinis.

      type: [String]
    }
  },
  {
    timestamps: true,
  }

);

// Déclarer une fonction pour crypter avec bcrypt. PS = (next en params pour enchainer, donner une réponse)
//  .pre = Avant la sauvegarde dans la bdd

UserSchema.pre("save", async function(next) {
    // bcrypt va  génerer  le "Salage" du mdp
    const salt = await bcrypt.genSalt();
    // Ne pas faire de fonction fléchée( () => ))à cause du this, bcrypt va Hasher
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//  Connexion : Pour s'assurer que le mdp avant et après hashage est similaire
// UserSchema.statics.login = async function(email, password, res) {
//   const user = await this.findOne({email})
//   console.log(email)
//   if(user) {
//     const auth = await bcrypt.compare(password, user.password)
    
//     if(auth) {
//       console.log(user)
//       return user

//     }else{
//       res.status(400).json({message : "Wrong password"})

//     }

//   }else{
//     res.status(400);json({message : "Email not found"})
//   }
// }
    
    
    
    
//     if(auth) {
//        console.log(user)
//        res.send("Nice")
      
//     }
//     throw Error('incorrect password')
//   }
//   throw Error('incorrect email')
// }

// UserSchema.statics.login = async function(email, password, res) {
//   const user = await this.findOne({email})
//   console.log(email)
//   if(user) {
//     const auth = await bcrypt.compare(password, user.password)
//     if(auth) {
//        console.log(user)
//        return user
      
//     }
//     throw Error('incorrect password')
//   }
//   throw Error('incorrect email')
// }




module.exports = mongoose.model("user", UserSchema)