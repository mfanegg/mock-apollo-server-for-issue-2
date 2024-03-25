import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// the crash only happens if REJECTION_TIMER_MILLIS < RESOLUTION_TIMER_MILLIS
const REJECTION_TIMER_MILLIS = 1000;
const RESOLUTION_TIMER_MILLIS = 3000;

const thisPromiseWillReject = () => {
  return new Promise((_, reject) => setTimeout(() => {
    reject(new Error('I am rejecting.'));
  }, REJECTION_TIMER_MILLIS));
}

const thisPromiseWillResolveAfterALongTime = () => {
  return new Promise((resolve) => setTimeout(resolve, RESOLUTION_TIMER_MILLIS));
}

const myResolverA = async () => {
  await thisPromiseWillReject();
}

const myResolverB = async () => {
  const x = thisPromiseWillReject();
  await x;
}

const myResolverC = async () => {
  const x = thisPromiseWillReject();
  await thisPromiseWillResolveAfterALongTime();
  await x;
}

// *************************
// the rest of the code below this comment was taken from apollo-server README.md (except I use myResolver)
// *************************

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    // swap out the below resolver between myResolverA, myResolverB, and myResolverC
    // myResolverC will crash the server
    hello: myResolverC
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);