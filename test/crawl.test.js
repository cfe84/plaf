const should = require("should")
const crawl = require("../src/crawl")
const fakeFs = require("./fakeFs");
const fakePath = require("./fakePath");

describe("crawl", () => {
  // prepare
  const folders = {
    "start": { type: "folder", name: "start", content: ["markdownFile.md", "textFile.txt", "subfolder"] },
    "start/markdownFile.md": { name: "markdownFile.md", type: "file", expectedType: "md", content: "Markdown" },
    "start/textFile.txt": { name: "textFile.txt", type: "file", content: "Text file" },
    "start/.textFile.txt": { name: "textFile.txt", ignored: true, type: "file", content: "Text file" },
    "start/subfolder": { name: "subfolder", type: "folder", content: ["markdown2.md", "subsubfolder"] },
    "start/subfolder/markdown2.md": { name: "markdown2.md", type: "file", expectedType: "md", content: "Markdown again" },
    "start/subfolder/subsubfolder": { name: "subsubfolder", type: "folder", content: ["file.txt"] },
    "start/subfolder/subsubfolder/file.txt": { name: "file.txt", type: "file", content: "Text" }
  };
  const ignored = 1;
  const fs = fakeFs(folders);
  const path = fakePath;
  const deps = { fs, path }

  // exec
  const output = crawl("start", "dfsf", deps);
  // assess
  it("gets all folders and repositories", () => {
    const properties = Object.getOwnPropertyNames(folders);
    properties.forEach(propertyName => {
      const folder = folders[propertyName];
      const matchingOutput = output.find(out => out.path === propertyName)
      if (folder.ignored) {
        should(matchingOutput).be.undefined();
      } else {
        should(matchingOutput).not.be.undefined();
        should(matchingOutput.type).eql(folder.expectedType || folder.type);
        should(matchingOutput.filename).eql(folder.name);
        should(matchingOutput.relativePath).eql(propertyName.replace("start/", "").replace("start", ""));
      }
    })
    should(output).have.lengthOf(properties.length - ignored)
  });
})