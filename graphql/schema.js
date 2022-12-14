const { buildSchema } = require('graphql');

module.exports = buildSchema(`

    input UserInputData{
        email: String!
        name: String!
        password: String!
    }

    type Post{
        _id: ID
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User{
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData{
        token: String!
        userId: String!
    }

    type RootQuery{
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation{
        createUser(userInput: UserInputData): User!
    }
    

    schema {
        mutation: RootMutation
    }
`)