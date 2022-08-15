const http = require("http");
const { exec, execFile, spawn } = require("child_process");

const { validateOptions } = require("./utils")
const config = require("./config.json");


// Required wpScan on the system

const requestListener = async (req, res) => {

   let body = '';

    for await (const chunk of req) {
        body += chunk;
    }

    if (body.length > 1e6) {
        req.connection.destroy();
    }

    body = JSON.parse(body);

    const { target, options, token } = body;

    /*
    //The following enumeration options exist:

    vp (Vulnerable plugins)
    ap (All plugins)
    p (Popular plugins)
    vt (Vulnerable themes)
    at (All themes)
    t (Popular themes)
    tt (Timthumbs)
    cb (Config backups)
    dbe (Db exports)
    u (User IDs range. e.g: u1-5)
    m (Media IDs range. e.g m1-15)
    */

    const isValidOptions = validateOptions(options);

    const child = spawn("yes | wpscan", ['--url', target, '--api-token', token, '-o', "./wpscan_output.txt", "--random-user-agent", "-e", options], {shell: true})

    let streamData = ""; 

    child.stdout.on('data', data => {
        streamData +=  data;
    });

    child.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({success: false, target, message: "something went wrong"}));
    });

    child.on("close", () => {
        console.log(streamData);
        console.log("close");
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({
            success: true,
            target,
            data: streamData
        }));
    })

    /*
    const cmd = `yes | wpscan --url ${target} --api-token ${token} -o wpscan_output.txt --random-user-agent -e ${options}`;

    execFile(cmd, [], (error, stdout, stderr) => {

        if (error) {
            console.error(`error: ${error.message}`);
            console.log(error)
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, target}));
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, target}));
            return;
        }

        console.log("stdout", stdout);
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({
            success: true,
            data: {
                target,
                result: stdout
            }
        }));

    });
    */

}

const server = http.createServer(requestListener);
const port = 4006;

server.listen(port, () => {
    console.log("* wpScan service started at port", port)
});
