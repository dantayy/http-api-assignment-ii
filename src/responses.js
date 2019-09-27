// pull in the file system module
const fs = require('fs');
// querystring module for parsing querystrings from url
const query = require('querystring');

// vars for the html and css the client needs
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

// Note this object is purely in memory
// When node shuts down this will be cleared.
// Same when your heroku app shuts down from inactivity
// We will be working with databases in the next few weeks.
const users = {};

// for object to respond with when there are status messages/ids
const responseJSON = {};

// returns the base page for the client
const getIndex = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(index);
    response.end();
};

// returns the specified css for the client
const getCSS = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.write(css);
    response.end();
};

// respond with json data
const respondJSON = (request, response, status, object) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(object));
    response.end();
};

// respond only with headers
const respondJSONMeta = (request, response, status) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end();
};

// add a user
const addUser = (request, response) => {
    // vars for processing data sent to server for adding a user
    const body = [];
    let bodyString = '';
    let bodyParams = {};

    // .on calls are like event listeners triggering as the users data stream is being processed
    request.on('error', (err) => {
        console.log(err);
        response.statusCode = 400;
        response.end();
    });

    // process data
    request.on('data', (chunk) => {
        body.push(chunk);
    });

    // handle fully processed post data
    request.on('end', () => {
        bodyString = Buffer.concat(body).toString();
        bodyParams = query.parse(bodyString);
        
        // start with failstate message and check for missing params first
        responseJSON.message = 'Name and age are both required';
        if (!bodyParams.name || !bodyParams.age) {
            responseJSON.id = 'missingParams';
            return respondJSON(request, response, 400, responseJSON);
        }

        // potential response code if a new user was made
        let responseCode = 201;
        // case of a user needing to be updated rather than created
        if (users[bodyParams.name]) {
            responseCode = 204;
        } else { // create a new user
            users[bodyParams.name] = {};
        }

        // set the user's values
        users[bodyParams.name].name = bodyParams.name;
        users[bodyParams.name].age = bodyParams.age;

        // send a response with an obj if a new user was created
        if (responseCode === 201) {
            delete respondJSON.id;
            responseJSON.message = 'Created Successfully';
            return respondJSON(request, response, responseCode, responseJSON);
        }

        // return only header data if stuff was updated rather than created
        return respondJSONMeta(request, response, responseCode);  });
};

// return the users list
const getUsers = (request, response) => respondJSON(request, response, 200, {users});

// return only a 200 status in this case
const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

// send back notReal info
const notReal = (request, response) => {
    responseJSON.id = 'notFound';
    responseJSON.message = 'The page you are looking for was not found.';

    return respondJSON(request, response, 404, responseJSON);
};

// send back only the header data for a page that doesn't exist
const notRealMeta = (request, response) => respondJSONMeta(request, response, 404);

// export relevant functions
module.exports = {
    getIndex,
    getCSS,
    getUsers,
    getUsersMeta,
    notReal,
    notRealMeta,
    addUser,
};
