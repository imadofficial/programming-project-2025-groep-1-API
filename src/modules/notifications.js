async function sendNotification(userIds, title, messages) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('userIds must be a non-empty array');
    }

    // Validate that all userIds are integers
    if (!userIds.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('All userIds must be positive integers');
    }

    if (typeof title !== 'string' || title.trim() === '') {
        throw new Error('title must be a non-empty string');
    }

    // Validate that all messages are strings
    if (!Array.isArray(messages) || messages.length !== userIds.length || !messages.every(msg => typeof msg === 'string')) {
        throw new Error('messages must be an array of strings with the same length as userIds');
    }

   const promises = userIds.map((userId, index) =>
       fetch(`https://school.raven.co.com/`, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
                to: userId,
                title: title,
                body: messages[index],
           }),
       })
   );
   await Promise.all(promises);
}

module.exports = {
    sendNotification
};