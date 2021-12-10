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

module.exports = { fetchReq };
