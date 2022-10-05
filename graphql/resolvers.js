const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

module.exports = {
    createUser: async function(args, req){
        const email = args.userInput.email;
        const password = args.userInput.password;
        const name = args.userInput.name;
        const errors = [];

        if(!validator.isEmail(email)){
            errors.push({message: 'email is invalid'});
        }

        if(!validator.isEmpty(password) || !validator.isLength(password, {min: 5})){
            errors.push({message: 'password too short'});
        }

        if(errors.length > 0){
            const error = new Error('invalid input');
            error.data = error;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({email: userInput.email});

        if(existingUser){
            const error = new Error('User exists already');
            throw error;
        }

        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            name: name,
            password: hashedPw
        });
        
        const createdUser = await user.save();

        return { ...createdUser._doc, _id: createdUser._id.toString()  }
    },

    login: async function({email, password}, req){
        const user = await User.findOne({email: email});

        if(!user){
            const error = new Error('user not found');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if(!isEqual){
            const error = new Error('password is incorrect');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'somesupersecretsecret', {expiresIn: '1h'});

        return{ token, userId: user._id.toString() };
    }
}