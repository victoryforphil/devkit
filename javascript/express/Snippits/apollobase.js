var schema = buildSchema(`
  type Mutation{
    newSomething(name: String!): Something,
  }
  
  type Query {
    allSomethings: [Something],
    something(id: String!): Something 
  }
  
  type Something{
    id: String,
    name: String,
  }
`);

var root = {
  allSomethings: (args, context) => {
    return {}
  },
  something: (args, context) => {
    return {}
  },
  newSomething: ({id, name, desc}, context) =>{
    return {}
  },
};

//Starting the server
app.use('/graphi', graphiqlExpress({endpointURL: "/graphql"}))

app.use('/graphql', graphqlExpress(request=>{
  return({
    schema: schema,
    rootValue: root,
    context:{
      opticsContext : OpticsAgent.context(request),
      user: request.user
    }
})}));