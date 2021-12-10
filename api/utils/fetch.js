const axios =  require("axios");

const fetchReq = async (method, url, data) => {
    console.log(url)
    const result = await axios({ method, url, data })
        .then(data => data)
        .catch(err => console.log(err));

    return result;

}

module.exports = { fetchReq };
