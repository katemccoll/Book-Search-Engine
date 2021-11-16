const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Book {
        _id: ID
        authors: [String]
        description: String
        bookId: String
        image: String
        link: String
        title: String
    }
    
    type User {
        _id: ID
        username: String
        email: String
        password: String
        bookCount: Int
        savedBooks: [Book]
    }
    
    input savedBooks {
        authors: [String]
        description: String
        bookId: String
        image: String
        link: String
        title: String
    }
    
    type Auth {
        token: ID!
        user: User
    }
    
    type Query {
        me: User
    }
    
    type Mutation {
        addUser(username: String!, email: String!, password: String!): Auth
        login(email: String!, password: String!): Auth
        saveBooks(input: savedBooks!): User
        removeBook(bookId: String!): User
    }
`

module.exports = typeDefs;