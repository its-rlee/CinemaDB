const { createLogger, format, transports } = require("winston");

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
            // Custom properties
            const location = 'USA'; // location information 
            const customMessage = 'Final-Project-Spring-CS548'; // custom message
            const companyName = 'SFBU'; // company name

            return `[${timestamp}] [${level.toUpperCase()}] ${location} ${customMessage} ${companyName}: ${message}`;
        }),),
    transports: [
        new transports.Console({ format: format.combine(format.colorize()) }),
    ]
});


module.exports = logger;
