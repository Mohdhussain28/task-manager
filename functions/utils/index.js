module.exports = {
    success: (payload, message = "your request has been successful") => {
        const p = payload ? payload : {};
        return { success: true, message: message, ...p };
    },
    error: (payload, message = "an error occured") => {
        return { success: false, message: message, error: payload };
    },
};
