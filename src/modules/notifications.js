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

    // messages must be an array of strings
    if (!Array.isArray(messages) || messages.length === 0 || !messages.every(msg => typeof msg === 'string' && msg.trim() !== '')) {
        throw new Error('messages must be a non-empty array of non-empty strings');
    }

    if (userIds.length !== messages.length) {
        throw new Error('userIds and messages arrays must have the same length');
    }

    const promises = userIds.map((userId, i) =>
        fetch(`https://school.raven.co.com/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: userId,
                title: title,
                body: messages[i],
            }),
        })
    );
    const responses = await Promise.all(promises);
    return responses;
}

module.exports = {
    sendNotification
};