const axios =  require("axios");

const validateOptions = (options = "") => {
    const stringOptions = options.replace(/\s/g, '');
    const arrayOptions = stringOptions.split(",");
    const validOptions = ["vp", "ap", "p", "vt", "at", "t", "tt", "cb", "dbe", "u", "m"];

    console.log(`validOptions`,validOptions)
    
    let isValid = true;
    arrayOptions.forEach(option => {
        if(!validOptions.includes(option)) {
            isValid = false;
        }
    });

    return isValid;

}
const fetchReq = async (method, url, data) => {

    const result = await axios({ method, url, data, timeout: false})
        .then(data => data.data)
        .catch(err => {
            console.log(err)
            return err;
        });

    return result;

}

module.exports = { fetchReq, validateOptions };
