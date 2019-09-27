// pull in http module
const http = require('http');
// url module for parsing url string
const url = require('url');
// pull in our custom file
const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// here we create a object to route our requests to the proper
// handlers. the top level object is indexed by the request
// method (get, head, etc). We can use request.method to return
// the routing object for each type of method. Once we say
// urlStruct[request.method], we recieve another object which
// routes each individual url to a handler. We can index this
// object in the same way we have used urlStruct before.
const urlStruct = {
  GET: {
    '/': responseHandler.getIndex,
    '/style.css': responseHandler.getCSS,
    '/getUsers': responseHandler.getUsers,
    '/notReal': responseHandler.notReal,
  },
  HEAD: {
    '/getUsers': responseHandler.getUsersMeta,
    '/notReal': responseHandler.notRealMeta,
  },
  POST: {
    '/addUser': responseHandler.addUser,
  },
};

// when a call is made to this server run this
const onRequest = (request, response) => {
  // parse the url using the url module
  // This will let us grab any section of the URL by name
  const parsedUrl = url.parse(request.url);

  // check if the path name (the /name part of the url) matches
  // any in our url object. If so call that function. If not, default to notReal
  if (urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response);
  } else {
    urlStruct[request.method]['/notReal'](request, response);
  }
};

// create a server that runs the onRequest function when pinged and listens at the specified port
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
