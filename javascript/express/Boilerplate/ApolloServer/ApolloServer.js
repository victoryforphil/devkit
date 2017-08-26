var express     = require('express');
var bodyParser  = require('body-parser');
var session     = require('express-session')
var Logger      = require("disnode-logger");
var OpticsAgent = require('optics-agent');
var { graphqlExpress, graphiqlExpress } = require ( 'apollo-server-express');
var { buildSchema }                     = require('graphql');

var path = require('path');
var cors = require('cors')

var corsOptions = {
  origin: '',
  credentials: true // <-- REQUIRED backend setting
};


var app = express().use('*', cors(corsOptions));


var port = 4444;

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(session({
  secret: '',
  resave: true,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// The root provides a resolver function for each API endpoint
var ClubHandler = require("./server/handlers/ClubHandler")
var root = {
  allSomethings: (args, context) => {
    return {}
  },
  something: (args, context) => {
    return ClubHandler.GetClubs()
  },
  newSomething: ({id, name, desc}, context) =>{
    return ClubHandler.NewClub(context.user,{id,name, desc})
  },
};

OpticsAgent.configureAgent({apiKey: "" })
OpticsAgent.instrumentSchema(schema);

app.use(OpticsAgent.middleware());

app.get('/status', function (req, res) {
  Logger.Info("Server", "Route: /status ", "Sending Health Status.");
  res.send('Online.')
})

app.use('/graphi', graphiqlExpress({endpointURL: "/graphql"}))

app.use('/graphql', graphqlExpress(request=>{
  return({
    schema: schema,
    rootValue: root,
    context:{
      opticsContext : OpticsAgent.context(request),
      user: request.user
    }
  })}
));

app.listen(port, function () {
	Logger.Success("Server", "Start", "Server Listening on port: " + port)
})
