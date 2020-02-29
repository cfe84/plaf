const { parseCommandLine } = require("yaclip");
const render = require("./src/render")

const options = [
  { name: "out", alias: "o", type: String, multiple: false },
  { name: "in", alias: "i", type: String, multiple: false },
  { name: "template", alias: "t", type: String, multiple: false }
]

const DEFAULT_TEMPLATE = "<html><head><title>{{title}}</title></head><body><h1>{{title}}</h1><div>{{content}}</div></body></html>"

let inputFolder = process.cwd();
let outputFolder = "rendered";
let defaultTemplate = DEFAULT_TEMPLATE;

const command = parseCommandLine(options);
if (command.out) {
  outputFolder = command.out.value;
}
if (command.in) {
  inputFolder = command.in.value;
}
if (command.template) {
  defaultTemplate = `${fs.readFileSync(command.template.value)}`;
}

render(inputFolder, outputFolder, defaultTemplate)