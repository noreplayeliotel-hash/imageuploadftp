module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 400).json({
    error: err.message || 'Something went wrong!'
  });
};