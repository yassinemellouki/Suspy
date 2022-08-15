const http = require("http");

const { } = require("./utils")
const config = require("./config.json");


const requestListener = async (req, res) => {

   let body = '';

    for await (const chunk of req) {
        body += chunk;
    }

    if (body.length > 1e6) {
        req.connection.destroy();
    }

    body = JSON.parse(body);

    const { } = body;


        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
    
}

const server = http.createServer(requestListener);
const port = 4000;

server.listen(port, () => {
    console.log("* copy service started at port", port)
});
