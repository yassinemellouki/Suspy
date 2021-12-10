const http = require("http");

const { fetchReq } = require("./utils")
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

    const { remoteAddress } = body;

    const data = await fetchReq("post", `${config.apis.domains_lockup}${remoteAddress}`);
    if(data.status === "Success") {

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));

    } else {

        res.writeHead(503, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));

    }
    
}

const server = http.createServer(requestListener);

server.listen( 4001, () => {
    console.log("* ip-lockup service started at port", 4001)
});



