const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        users: async () => {
            return User.find().populate("books");
        },
        user: async (parent, { username }) => {
            return User.findOne({ username }).populate("books");
        },
        books: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Book.find(params).sort({})
        },
        book: async (parent, { bookID }) => {
            return Book.findOne({ _id: bookID });
        },
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate("books");
            }
            throw new AuthenticationError("You need to be logged in!");
        },
    },

    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = signToken(user);
            return {token, user};
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return {token, user};
        },
        savedBooks: async (parent, { username }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: username } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("Unable to save book");
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const book = await Book.findOneAndDelete({
                    _id: bookId,
                    authors: context.user.username,
                });
                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { books: book._id } }
                );

                return book;
            }

            throw new AuthenticationError("You can not remove this book");
        },
    },
};

module.exports = resolvers;