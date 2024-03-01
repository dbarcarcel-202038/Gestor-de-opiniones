import posts from './post.model.js'
import User from '../user/user.model.js'
import jwt from 'jsonwebtoken'
import { checkUpdate } from '../../utils/validator.js'

export const add = async (req, res) => {
    try {
        let data = req.body
        let uid = req.user._id

        //let uid = req.user._id
        data.user = uid
        let publi = new posts(data)
        await publi.save()
        return res.send({ message: 'add post successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error add post', err: err })
    }
}

export const deleted = async (req, res) => {
    try {
        let { id } = req.params;
        let uid = req.user._id


        // Verificar si la publicación existe y si el usuario es el propietario
        let publication = await posts.findOne({ _id: id, user: uid });
        if (!publication)
            return res.status(404).send({ message: 'Post not found or you are not authorized to delete it' });

        // Eliminar la publicación
        let deletedPublication = await posts.findOneAndDelete({ _id: id, user: uid });
        if (!deletedPublication)
            return res.status(500).send({ message: 'Error deleting post' });

        return res.send({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting post' });
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let uid = req.user._id

        let updated = checkUpdate(data, id)
        let publication = await posts.findOne({ _id: id, user: uid });
        if (!publication) return res.status(404).send({ message: 'Post not found or you are not authorized to delete it' });
        if (!updated) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updatePubli = await posts.findOneAndUpdate({_id: id}, data, {new: true})
        if (!updatePubli) return res.status(401).send({ message: 'Post not found and not updated' })
        return res.send({ message: 'Updated publi', updatePubli })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating post' })
    }
}