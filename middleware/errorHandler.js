
const errorHandler = (err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Server Error';
    res.status(status).json({
        error: true,
        message,
        ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
    });
};

module.exports = { errorHandler };
