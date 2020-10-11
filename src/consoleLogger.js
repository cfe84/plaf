const levels = {
  "debug": 1,
  "verbose": 1,
  "info": 2,
  "warn": 3,
  "warning": 3,
  "err": 4,
  "error": 4,
  "none": 10,
  "off": 10
}

const consoleLogger = (logLevel = "info") => {
  const level = levels[logLevel]
  return {
    debug: (msg) => {
      if (level <= levels.debug) {
        console.debug(`[DEBUG] ${msg}`)
      }
    },
    info: (msg) => {
      if (level <= levels.info) {
        console.info(`[INFO] ${msg}`)
      }
    },
    warn: (msg) => {
      if (level <= levels.warn) {
        console.warn(`[WARNING] ${msg}`)
      }
    },
    error: (msg) => {
      if (level <= levels.error) {
        console.error(`[ERROR] ${msg}`)
      }
    },
  }
}

module.exports = consoleLogger