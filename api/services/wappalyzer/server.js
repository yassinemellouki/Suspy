const http = require("http");

const Wappalyzer = require('wappalyzer');

const { domainValidation } = require("./utils")
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

    const { target } = body;

    const options = {
      debug: false,
      delay: 500,
      headers: {},
      maxDepth: 3,
      maxUrls: 10,
      maxWait: 5000,
      recursive: true,
      probe: true,
      userAgent: 'Wappalyzer',
      htmlMaxCols: 2000,
      htmlMaxRows: 2000,
      noScripts: false,
      noRedirect: false,
    };

    const isValidTarget = domainValidation(target);

    const wappalyzer = new Wappalyzer(options);

    let results;

      try {
        await wappalyzer.init()

        // Optionally set additional request headers
        const headers = {}

        const site = await wappalyzer.open(target, headers)

        // Optionally capture and output errors
        site.on('error', console.error)

        results = await site.analyze()

        //console.log(JSON.stringify(results, null, 2))
    
      } catch (error) {
        console.error(error)
      }
      await wappalyzer.destroy()

    if(results) {
        const payload = {
            success: true,
            message: "",
            data: results
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(payload, null, 0));

    }

    const payload = {
        success: false,
        message: "something went wrong"
    }
    res.writeHead(500, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(payload));


}

const server = http.createServer(requestListener);
const port = 4004;

server.listen(port, () => {
    console.log("* wappalyzer service started at port", port)
});
