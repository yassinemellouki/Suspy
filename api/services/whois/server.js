const http = require("http");
const whois = require("whois-json");

const { fetchReq, addressValidation } = require("./utils")
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


    const { address } = body;


    const { validDomain, validIP } = addressValidation(address);

    if(!validDomain && !validIP ) {

        const payload = {
            success: false,
            message: "Domain or IP is not valid"
        }

        res.writeHead(400, {'Content-Type': 'application/json'});

        return res.end(JSON.stringify(payload))

    }

    const result = await whois(address);

        if(result && (result.domain || result.domainName || result.country || result.updated)) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify(result));
        }

        // Error
        console.log(result)
        res.writeHead(503, {'Content-Type': 'text/plain'});
        //res.end(JSON.stringify(result))
        res.end("Something went wrong!")
    
}

const server = http.createServer(requestListener);
const port = 4002;

server.listen(port, () => {
    console.log("* whois service started at port", port)
});



