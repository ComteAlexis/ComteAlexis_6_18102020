const Sauce = require('../model/Sauce')
const jwt = require('jsonwebtoken')
const fs = require('fs')

exports.getSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(500).json({error}))
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(500).json({error}))
}

exports.createSauce = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decodedToken.userId
    const sauceObject = JSON.parse(req.body.sauce)
    const sauce = new Sauce({
        ...sauceObject,
        userId: userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    })

    sauce.save()
        .then(() => res.status(201).json({message: 'Sauce créé'}))
        .catch(error => res.status(500).json({error}))
}

exports.updateSauce = (req, res, next) => {
    console.log(req.body.sauce)
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body}

    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then((sauce) => res.status(200).json({message: 'Sauce mise à jour'}))
        .catch(error => res.status(500).json({error}))
}

exports.deleteDauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const image = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${image}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'sauce supprimé'}))
                    .catch(error => res.status(500).json({error}))
            })
        })
        .catch(error => res.status(500).json({error}))
}

exports.likeDisLike = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decodedToken.userId
    
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            console.log(sauce.usersLiked.findIndex(elem => elem === userId))
            const isLike = sauce.usersLiked.findIndex(elem => elem === userId)
            const isDisLike = sauce.usersDisliked.findIndex(elem => elem === userId)
            switch (req.body.like){
                case 0:
                    if(isLike != -1){
                        console.log(isLike)
                        sauce.usersLiked.splice(isLike, 1)
                        console.log('ici ', sauce.usersLiked)
                        sauce.likes = sauce.usersLiked.length
                    }
                    if(isDisLike != -1){
                        sauce.usersDisliked.splice(isDisLike, 1)
                        sauce.dislikes = sauce.usersDisliked.length
                    }
                    break
                case 1:
                    if(isLike === -1){
                        sauce.usersLiked.push(userId)
                        sauce.likes = sauce.usersLiked.length
                    }
                    if(isDisLike != -1){
                        sauce.usersDisliked.splice(isDisLike, 1)
                        sauce.dislikes = sauce.usersDisliked.length
                    }
                    break
                case -1:
                    if(isDisLike === -1){
                        sauce.usersDisliked.push(userId)
                        sauce.dislikes = sauce.usersDisliked.length
                    }
                    if(isLike != -1){
                        sauce.usersliked.splice(isLike, 1)
                        sauce.likes = sauce.usersliked.length
                    }
                    break
            }

            Sauce.updateOne({_id: req.params.id},{
                usersDisliked: sauce.usersDisliked,
                usersLiked: sauce.usersLiked,
                likes: sauce.likes,
                dislikes: sauce.dislikes
            })
            .then(() => res.status(200).json({message: 'like mis a jour'}))
            .catch(error => res.status(500).json({error}))
            
        })
        .catch(error => res.status(500).json({error}))
}