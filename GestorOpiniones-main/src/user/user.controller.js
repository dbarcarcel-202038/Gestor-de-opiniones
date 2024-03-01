import User from './user.model.js'
import { encrypt, comparePassword, checkUpdate, checkUpdateClient } from '../../utils/validator.js'
import { generateJwt } from '../../utils/jwt.js'
import jwt from 'jsonwebtoken'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test good' })
}

export const defaultAdmin = async () => {
    try {
        const existingUser = await User.findOne({ username: 'default' });

        if (existingUser) {
            return;
        }
        let data = {
            name: 'Default',
            username: 'default',
            email: 'default@gmail.com',
            password: await encrypt('hola'),
        }

        let user = new User(data)
        await user.save()

    } catch (error) {
        console.error(error)
    }
}

export const signUp = async (req, res) => {
    try {
        let data = req.body
        let existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).send({ message: 'Username is already in use' });
        }
        data.password = await encrypt(data.password)
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

export const login = async (req, res) => {
    try {
        let { user, password } = req.body
        let users = await User.findOne({
            $or: [
                { username: user },
                { email: user }
            ]
        });
        if (users && await comparePassword(password, users.password)) {
            let loggedUser = {
                uid: users.id,
                username: users.username,
                email: users.email,
                name: users.name,
            }
            let token = await generateJwt(loggedUser)
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token })

        }
        return res.status(404).send({ message: 'Invalid credentials' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

export const update = async (req, res) => {
    try {
        let data = req.body;
        let { id } = req.params
        let uid = req.user._id
        let updated = checkUpdateClient(data, id)
        if(id != uid) return  res.status(401).send({ message: 'you can only update your account' })
        if (!updated) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updatedUsers = await User.findOneAndUpdate(
            { _id: id }, 
            data, 
            { new: true } 
        )
        if (!updatedUsers) return res.status(401).send({ message: 'User not found and not updated' })
        return res.send({ message: 'Updated user', updatedUsers })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating user .', error: error });
    }
}

export const updatePassword = async (req, res) => {
    try {
        let { oldPassword, newPassword } = req.body;
        let { id } = req.params;
        let uid = req.user._id
        if (id != uid) 
            return res.status(401).send({ message: 'You only can update your own account' });

        if (!newPassword) 
            return res.status(400).send({ message: 'New password is missing' });

        let user = await User.findOne({ _id: id });
        if (!user) 
            return res.status(404).send({ message: 'User not found' });

        if (!(await comparePassword(oldPassword, user.password))) 
            return res.status(401).send({ message: 'The old password is incorrect' });

        let updatedUser = await User.findOneAndUpdate(
            { _id: id }, 
            { password: await encrypt(newPassword) }, 
            { new: true } 
        );

        if (!updatedUser) 
            return res.status(404).send({ message: 'User not found or password not updated' });

        return res.send({ message: 'Password updated successfully', updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating password', error: error });
    }
};