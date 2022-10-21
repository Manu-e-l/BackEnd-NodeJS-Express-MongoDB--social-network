const multiplesErrors = {
    signUpErrors(err) {
        let errors = { pseudo: '', email: '', password: '' }

        if (err.message.includes('pseudo')) {
            errors.pseudo = 'Pseudo incorrect ou déjà pris'
        }

        if (err.message.includes('email')) {
            errors.email = 'Email incorrect'
        }

        if (err.message.includes('password')) {
            errors.password = 'Le mot de passe doit faire 6 caractères minimum';
        }

        if (err.code === 11000 && err.keyValue.pseudo) {
            errors.pseudo = 'Pseudo déjà pris'
        }

        if (err.code === 11000 && err.keyValue.email) {
            errors.email = 'Email déjà pris'
        }

        return errors

    },

    uploadErrors(err) {
        let errors = { format : "", maxSize: ""};
        
        if(err.message.includes('invalid file'))
            errors.format= "Format incompatible";

        if(err.message.includes('Max size'))
            errors.maxSize = "Le fichier dépasse 500 ko"

            return errors
    }

}

module.exports = multiplesErrors;