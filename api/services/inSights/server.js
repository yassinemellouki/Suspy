const http = require("http");
const crypto = require("crypto");
const fs = require('fs');

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const { addressValidation } = require("./utils")
const config = require("./config.json");

const desktopConfigs = require("./configs/lr-desktop-config");
const mobileConfigs = require("./configs/lr-desktop-config");
const {randomBytes} = require("crypto");


const requestListener = async (req, res) => {

   let body = '';

    for await (const chunk of req) {
        body += chunk;
    }

    if (body.length > 1e6) {
        req.connection.destroy();
    }

    body = JSON.parse(body);

    const { target, reportFormat} = body;


    if(!addressValidation(target) || !(reportFormat === "json" || reportFormat === "html") ) {
        const hash = crypto.randomBytes(8).toString("hex");

        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({
            success: false,
            message: "domain or report format is not valid",
            hash
        }));

    }

    const runInisght  = async () => {
        const hash = crypto.randomBytes(10).toString("hex");
        const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
        //const options = {logLevel: "silent", output: 'html', onlyCategories: null, formFactor: "desktop", enableErrorReporting: true, port: chrome.port};

        const runnerDesktopResult = await lighthouse(target, {port: chrome.port, output: reportFormat}, desktopConfigs);
        const runnerMobileResult = await lighthouse(target, {port: chrome.port, output: reportFormat}, mobileConfigs);

        // make reports dir
        const reportsDirName = "reports";
        if(!fs.existsSync(reportsDirName)) {
            fs.mkdirSync(reportsDirName)
        }

        // `.report` is the HTML report as a string
        const reportDesktopHtml = runnerDesktopResult.report;
        fs.writeFileSync(`./${reportsDirName}/lhdesktopreport-${hash}.${reportFormat}`, reportDesktopHtml);
        const reportMobileHtml = runnerMobileResult.report;
        fs.writeFileSync(`./${reportsDirName}/lhmobilereport-${hash}.${reportFormat}`, reportMobileHtml);


        await chrome.kill();

        if(reportMobileHtml || reportDesktopHtml) {
            return  {
                mobileResults: reportDesktopHtml,
                desktopResults: reportDesktopHtml,
            }
        }

        return false;

    
    };

    const data = await runInisght();

    if (data) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({
            success: false,
            data
        }));

    } else {
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({
            success: false,
            message: "something went wrong!"
        }));
    }


}

const server = http.createServer(requestListener);
const port = 4005;

server.listen(port, () => {
    console.log("* insights service started at port", port)
});
