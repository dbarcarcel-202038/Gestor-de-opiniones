import jwt from 'jsonwebtoken'
import User from '../user/user.model.js'

export const validateJwt = async (req, res, next) => {
    try {
        let secretKey = process.env.SECRET_KEY
        let { authorization } = req.headers
        if (!authorization) return res.status(401).send({ message: 'Not authorized' })
        let { uid } = jwt.verify(authorization, secretKey)
        let user = await User.findOne({ _id: uid })
        if (!user) return res.status(404).send({ message: 'user not found' })
        req.user = user
        next()
    } catch (error) {
        console.error(error);
        return res.status(401).send({ message: 'Invalid token' })
    }
}