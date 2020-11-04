const http = require("http")
const path = require("path")
const url = require("url")

const server = (context) => {
  const httpServer = http.createServer((req, res) => {
    if (req.method !== "GET") {
      res.statusCode = 400
      res.write("Only GET is allowed")
      res.end()
    }
    context.deps.logger.debug(`Received request for ${req.url}`)
    const parsedUrl = url.parse(req.url, true)
    let receivedUrl = parsedUrl.pathname
    if (receivedUrl.substring(receivedUrl.length - 1) === "/") {
      receivedUrl += "index.html"
    }
    receivedUrl = decodeURI(receivedUrl)
    const requestedFile = path.join(context.outputFolder, ...receivedUrl
      .substring(1)
      .split("/")
    )
    context.deps.logger.info(`Retrieving file '${requestedFile}'`)
    if (context.deps.fs.existsSync(requestedFile)) {
      if (context.deps.fs.lstatSync(requestedFile).isDirectory()) {
        requestedFile = path.join(requestedFile, "index.html")
      }
      const file = context.deps.fs.readFileSync(requestedFile)
      res.statusCode = 200
      res.write(file)
    } else {
      context.deps.logger.warn(`Server - Not found: ${requestedFile} (url: ${req.url})`)
      res.statusCode = 404
      res.write(`${requestedFile} not found`)
    }
    res.end()
  })

  httpServer.listen(context.port, () => { context.deps.logger.info(`Listening on port ${context.port}`) })
}

module.exports = server