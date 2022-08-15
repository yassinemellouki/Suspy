const axios =  require("axios");

const fetchReq = async (method, url, data) => {

    const result = await axios({ method, url, data, timeout: 4000 })
        .then(data => data.data)
        .catch(err => {
            console.log(err)
            return err;
        });

    return result;

}

const addressValidation = (address) => {

    // to Check (ftp, http, https)
    const validDomain = /((ftp|http|https):\/\/)?([a-z0-9]+\.)?([a-z0-9][a-z0-9-]*)?((\.[a-z]{2,6})|(\.[a-z]{2,6})(\.[a-z]{2,6}))/.test(address);

    const validIP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(address);

    return {validDomain, validIP}

}

module.exports = { fetchReq, addressValidation };
