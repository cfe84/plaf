const { parseCommandLine } = require("yaclip");
const systemFs = require("fs");
const path = require("path")
const handlebars = require("handlebars")
const marked = require("marked");
const templateFactory = require("./src/templateFactory")
const consoleLogger = require("./src/consoleLogger")
const crawl = require("./src/crawl")
const preprocess = require("./src/preprocess")
const processMd = require("./src/processMd")
const cleanup = require("./src/cleanup");
const cleanupInMemFs = require("./src/cleanupInMemFs");
const buildDirectoryStructure = require("./src/buildDirectoryStructure")
const copyFiles = require("./src/copyFiles");
const renderMd = require("./src/renderMd");
const generateIndex = require("./src/generateIndex")
const generateTags = require("./src/generateTags")
const saveCatalog = require("./src/saveCatalog")
const generateSearchCatalog = require("./src/generateSearchCatalog")
const generateSearchPage = require("./src/generateSearchPage")
const usage = require("command-line-usage")
const mdExtensions = require("./src/mdExtensions")
const mdWikiLinks = require("./src/mdWikiLinks")
const mdConvert = require("./src/mdConvert")
const encryptContent = require("./src/encryptContent")
const crypto = require("crypto-js");
const inMemoryFs = require("./src/inMemoryFs");
const compositeFs = require("./src/compositeFs");
const server = require("./src/server");
const linkFs = require("./src/linkFs");

const serveOptions = [
  { name: "port", alias: "p", type: Number },
]

const options = [
  { name: "serve", alias: "S", type: Boolean, subcommands: serveOptions },
  { name: "help", alias: "h", type: Boolean, multiple: false, description: "Display this message" },
  { name: "log", alias: "l", type: String, multiple: false, description: "Log level (debug, info, warn, error)" },
  { name: "name", alias: "n", type: String, multiple: false, description: "Name for the root" },
  { name: "out", alias: "o", type: String, multiple: false, description: "Folder where to render. This will be wiped out, be sure you're ok with that first" },
  { name: "in", alias: "i", type: String, multiple: false, description: "Folder which will be crawled and rendered" },
  { name: "template", alias: "t", type: String, multiple: false, description: "Default template file" },
  { name: "template-folder", alias: "T", type: String, multiple: false, description: "Folder where templates will be looked for" },
  { name: "generate-search", alias: "s", type: Boolean, multiple: false, description: "Generate a search index (experimental)" },
  { name: "password", alias: "p", type: String, multiple: false, description: "Encrypts markdown content with the provided password" },
  { name: "no-md-extensions", alias: "M", type: Boolean, multiple: false, description: "Don't use the md extensions" }
]


function displayHelp() {
  const structure = [
    {
      header: 'Plaf - static site generator'
    },
    {
      header: 'Commands',
      optionList: options
    }
  ];
  const message = usage(structure);
  console.log(message);
}

let search = false
let inputFolder = process.cwd()
let outputFolder = "rendered"
let defaultTemplate = null
let name = path.basename(inputFolder)
let mdExtensionsActive = true
let serve = false
let port = 8080
let fs = systemFs
let lfs = undefined
let inMemFs = undefined
let password = undefined
let logLevel = "info"
const inMemoryStruct = {}
const deps = {}

const command = parseCommandLine(options);
if (command.log) {
  logLevel = command.log.value;
}
const logger = consoleLogger(logLevel)
if (command.help) {
  displayHelp();
  return;
}
if (command.out) {
  outputFolder = command.out.value;
  logger.debug(`Option - Outputting to ${outputFolder}`)
}
if (command.in) {
  inputFolder = command.in.value;
  logger.debug(`Option - Input from ${inputFolder}`)
}
let templateFolder = path.join(inputFolder, ".plaf")
if (command["template-folder"]) {
  templateFolder = command["template-folder"].value
  logger.debug(`Option - Using template folder ${templateFolder}`)
}
if (command.template) {
  defaultTemplate = command.template.value
  logger.debug(`Option - Using default template ${defaultTemplate}`)
}
if (command.name) {
  name = command.name.value
  logger.debug(`Option - Using name ${name}`)
}
if (command["generate-search"]) {
  search = true
  logger.debug(`Option - Generate search`)
}
if (command["no-md-extensions"]) {
  mdExtensionsActive = false
  logger.debug(`Option - md extensions deactivated`)
}
if (command["password"]) {
  password = command.password.value
  logger.debug(`Option - Password specified, encrypting all markdown content`)
}

if (command["serve"]) {
  serve = true
  inMemFs = inMemoryFs(inMemoryStruct)
  lfs = linkFs(deps)
  fs = compositeFs(lfs, inMemFs, systemFs)
  logger.debug(`Option - serve`)
  if (command.serve.port) {
    port = command.serve.port.value
    logger.debug(`Option - Serving on port ${port}`)
  }
  if (command["out"]) {
    logger.warn("Warning: '--out' option specified, however file generation is deactivated when serving")
  }
} else {
  logger.debug(`Option - '--serve' not specified, therefore just generating`)
}

const contentEncrypter = encryptContent(password)
const encrypt = (content, pwd) => crypto.AES.encrypt(content, pwd).toString()

deps.fs = fs
deps.path = path
deps.handlebars = handlebars
deps.marked = marked
deps.encrypt = encrypt
deps.inMemFs = inMemFs
deps.linkFs = lfs
deps.logger = logger

const initializedTemplateFactory = templateFactory(defaultTemplate, templateFolder, deps)
deps.getTemplate = initializedTemplateFactory

const context = { inputFolder, outputFolder, deps, name, port, serve }

const pipeline = [
  { order: 100, step: (context) => context.folderContent = crawl(context) },
  { order: 200, step: preprocess },
  { order: 300, step: processMd },
  { order: 340, step: mdConvert },
  { order: 360, step: contentEncrypter },
  { order: 500, step: buildDirectoryStructure },
  { order: 600, step: copyFiles },
  { order: 700, step: renderMd },
  { order: 800, step: generateIndex },
]

if (serve) {
  pipeline.push(
    { order: 400, step: cleanupInMemFs }
  )
} else {
  // When actually generating, cleanup output folder and copy files
  pipeline.push(
    { order: 400, step: cleanup },
  )
}

if (mdExtensionsActive) {
  pipeline.push(
    { order: 320, step: mdExtensions },
    { order: 330, step: mdWikiLinks },
    { order: 900, step: generateTags },
  )
}

if (search) {
  pipeline.push(
    { order: 390, step: generateSearchPage },
    { order: 1000, step: (context) => fs.mkdirSync(path.join(context.outputFolder, "search"), { recursive: true }) },
    { order: 1100, step: saveCatalog },
    { order: 1200, step: generateSearchCatalog },
  )
}

const runPipeline = () => {
  logger.info("Pipeline - Running generation pipeline")
  pipeline
    .sort((a, b) => a.order - b.order)
    .forEach(step => step.step(context))
  logger.info("Pipeline - Done")

}

const watchAndRun = () => {
  let needsToRun = true
  const loop = () => {
    try {
      if (needsToRun) {
        runPipeline()
      }
    }
    catch (error) {
      deps.logger.error(`Watcher - ${error}`)
    }
    finally {
      needsToRun = false
      setTimeout(() => loop(), 250)
    }
  }
  loop()
  systemFs.watch(inputFolder, { recursive: true }, (evt, fileName) => {
    logger.debug(`Watcher - ${fileName} changed, running pipeline`)
    needsToRun = true
  })
}

if (serve) {
  // when serving, pipeline runs everytime a change occurs
  watchAndRun()
  server(context)
} else {
  // if generating, pipeline runs once
  runPipeline()
}