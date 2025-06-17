async function sendNotification(userIds, title, message) {
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

    if (typeof message !== 'string' || message.trim() === '') {
        throw new Error('message must be a non-empty string');
    }

   const promises = userIds.map(userId =>
       fetch(`https://school.raven.co.com/`, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
                to: userId,
                title: title,
                body: message,
           }),
       })
   );
   const responses = await Promise.all(promises);
   return responses.map(response => {
       if (!response.ok) {
           throw new Error(`Failed to send notification: ${response.statusText}`);
       }
       return response.json();
   });
}

module.exports = {
    sendNotification
};