let idCounter = 0;
const blacklist = [];

const add = (url) => {
    // Creates a new object named entry that looks like this: { id: , url: }
    const entry = { id: ++idCounter, url };
    // Adding the new object to the list
    blacklist.push(entry);
    // Returns the object so the controller can send it back to the client
    return entry;
}

const remove = (id) => {
    // Find the index in the blacklist array of the link with the id that we want to delete
    const index = blacklist.findIndex(entry => entry.id === Number(id));
    // If we found a valid index
    if (index !== -1) {
        // Deletes one link starting from the index we found.
        blacklist.splice(index, 1);
        return true;
    }
    // We couldn't find the ID.
    return false;
};

// Export
module.exports = {
    add,
    remove
};