const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../model/User')

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hashPassword => {
            const user = new User({
                email: req.body.email,
                password: hashPassword
            })
            user.save()
                .then(() => res.status(200).json({message: 'Utilisateur créé'}))
                .catch(error => res.status(500).json({error}))
        })
        .catch(error => res.status(500).json({error}))
}

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            bcrypt.compare(req.body.password, user.password)
                .then((result) => {
                    if(result){
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                {userId: user._id},
                                'RANDOM_TOKEN_SECRET',
                                {expiresIn: '24h'}
                            )
                        })
                    }
                    else{
                        res.status(401).json({error: 'Mot de passe incorect'})
                    }
                })
                .catch(error => res.status(500).json({error}))
        })
        .catch(error => res.status(401).json({error: 'Utilisateur introuvable'}))
}