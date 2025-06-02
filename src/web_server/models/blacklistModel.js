// Counter used to assign temporary IDs to blacklist entries
let idCounter = 0;
const { sendRequest } = require('../utils/mailUtils');


const add = async (url) => {
    try {
        const response = await sendRequest("POST", url);
        return response;
    }
    catch (error) {
        console.error("Error in post url:", error);
        throw error;
    }
};

const remove = async (url) => {
    try {
        const response = await sendRequest("DELETE", url);
        return response;
    } catch (error) {
        console.error("Error in delete url:", error);
        throw error;
    }
};

module.exports = {
    add,
    remove
};
