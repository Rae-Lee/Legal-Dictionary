const errorHandler = (err, req, res) => {
  return res.json({
    status: 500,
    message: `${err.name}` || 'internal server error'
  })
}
module.exports = errorHandler
