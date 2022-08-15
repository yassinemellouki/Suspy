const axios =  require("axios");
const Evilscan = require('evilscan');
const dns = require("dns");

const fetchReq = async (method, url, data) => {

    const result = await axios({ method, url, data, timeout: false})
        .then(data => data.data)
        .catch(err => {
            console.log(err)
            return err;
        });

    return result;

}

const addressValidation = (address) => {

    const validDomain = /((ftp|http|https):\/\/)?([a-z0-9]+\.)?([a-z0-9][a-z0-9-]*)?((\.[a-z]{2,6})|(\.[a-z]{2,6})(\.[a-z]{2,6}))/.test(address);

    const validIP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(address);

    return {validDomain, validIP}

}

const lookupPromise =  (target) => {
    return new Promise((resolve, reject) => {
        dns.lookup(target, (err, address, family) => {
            if(err) reject(err);
            resolve(address);
        });
    });
}


const EvilScanTrigger = (res, options) => {

    const evilscan = new Evilscan(options);

    const result = [];

    evilscan.on('result', data => {
        result.push(data);
    });

    evilscan.on('done', data => {

        const payload = {
            success: true,
            message: "",
            data: result.sort((a, b) => b.banner.length - a.banner.length)
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(payload));

    });

    evilscan.on('error', err => {

        const payload = {
            success: true,
            message: "Something went wrong!"
        }

        res.writeHead(500, {'Content-Type': 'text/plain'});
        return res.end(payload);
    });

    evilscan.run();
}

module.exports = { fetchReq, addressValidation, lookupPromise, EvilScanTrigger };
