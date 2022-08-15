const http = require("http");
const { exec } = require("child_process");


const { EvilScanTrigger, addressValidation, lookupPromise } = require("./utils")
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

    let { target, port, status} = body;

    const {validDomain, validIP} = addressValidation(target);

    if(!validDomain && !validIP ) {

        const payload = {
            success: false,
            message: "Targeted Domain or IP is not valid"
        }

        res.writeHead(400, {'Content-Type': 'application/json'});

        return res.end(JSON.stringify(payload))

    }

    const options = {
        target,
        port,
        status, // Timeout, Refused, Open, Unreachable (TROU)
        banner:true
    };


    if(validDomain) {
        return lookupPromise(target)
            .then(address => {
                options.target = address;
                EvilScanTrigger(res, options);
            })
            .catch(err => {

                console.log(err);

                const payload = {
                    success: false,
                    message: "Targetted Domain lockup Error"
                }

                res.writeHead(400, {'Content-Type': 'application/json'});

                return res.end(JSON.stringify(payload))
            })
    }


    EvilScanTrigger(res, options);


};

const server = http.createServer(requestListener);
const port = 4003;

server.listen(port, () => {
    console.log("* evilscan service started at port", port);
});
