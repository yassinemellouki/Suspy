const axios =  require("axios");

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

    const validDomain = /((http|https):\/\/)+([a-z0-9]+\.)?([a-z0-9][a-z0-9-]*)?((\.[a-z]{2,6})|(\.[a-z]{2,6})(\.[a-z]{2,6}))/.test(address);


    return validDomain

}

module.exports = { fetchReq, addressValidation };
