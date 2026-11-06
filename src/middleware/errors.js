module.exports = (err, req, res, next) => {
    //console.error(err);

    const status = err.status || 500;

    res.status(status).json({
        success: false,
        message: status === 500
            ? 'Internal server error'
            : err.message,

        ...(process.env.NODE_ENV === 'development'
            ? { detail: err.message }
            : {})
    });
};