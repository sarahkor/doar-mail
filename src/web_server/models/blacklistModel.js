const { sendRequest } = require('../utils/mailUtils');

const add = async (url) => {
    try {
        const response = await sendRequest("POST", url);
        return response;
    }
    catch (error) {
        throw error;
    }
};

const remove = async (url) => {
    try {
        const response = await sendRequest("DELETE", url);
        return response;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    add,
    remove
};
