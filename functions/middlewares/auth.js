const admin = require("firebase-admin");
const functions = require("firebase-functions");
const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
    let token = null;
    if (req?.headers?.authorization) token = req.headers.authorization;
    else if (!token && req.cookies) token = req.cookies.__session;
    else
        return res
            .status(401)
            .send({ success: false, error: "Unauthorized Request - 1" });

    try {
        req.user = jwt.verify(token, "asdfghjkl", (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err.message);
                // Handle the error, e.g., return an unauthorized response
            } else {
                console.log('JWT verified successfully:', decoded);
                // Process the decoded information, e.g., use it for authentication
            }
        })
        return next();
    } catch (error) {
        functions.logger.error(error);
        return res.status(401).send({
            success: false,
            message: "Not Authorized, Couldn't verify user token",
            error: error,
        });
    }
};
