const errorHandler = (err, req, res) => {
  res.json({
    status: 500,
    message: err.name || 'internal server error'
  })
}
module.exports = errorHandler
