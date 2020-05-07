const should = require("should")
const crawl = require("../src/crawl")
const fakeFs = require("./fakeFs");
const fakePath = require("./fakePath");

describe("crawl", () => {
  // prepare
  const folders = {
    "start": { type: "folder", name: "start", files: ["markdownFile.md", "textFile.txt", "subfolder", "ref"] },
    "start/markdownFile.md": { name: "markdownFile.md", type: "file", expectedType: "md", content: "Markdown" },
    "start/textFile.txt": { name: "textFile.txt", type: "file", content: "Text file" },
    "start/.textFile.txt": { name: "textFile.txt", ignored: true, type: "file", content: "Text file" },
    "start/.plaf/": { name: "resources", ignored: true, type: "folder", files: ["textFile.txt", "resources"] },
    "start/.plaf/textFile.txt": { name: "textFile.txt", ignored: true, type: "file", content: "Text file" },
    "start/.plaf/resources": { name: "resources", ignored: true, type: "folder", files: ["textFile.txt"] },
    "start/.plaf/resources/textFile.txt": { name: "textFile.txt", type: "file", content: "Text file", targetRelativePath: "textFile.txt", skipIndexing: true, hidden: true },
    "start/subfolder": { name: "subfolder", type: "folder", files: ["markdown2.md", "subsubfolder", ".plaf"], expectedTemplate: "customTemplate" },
    "start/subfolder/.plaf": { name: ".plaf", type: "file", ignored: true, content: "template: customTemplate" },
    "start/subfolder/markdown2.md": { name: "markdown2.md", type: "file", expectedType: "md", content: "Markdown again" },
    "start/subfolder/subsubfolder": { name: "subsubfolder", type: "folder", files: ["file.txt"] },
    "start/subfolder/subsubfolder/file.txt": { name: "file.txt", type: "file", content: "Text" },
    "start/ref": { name: "ref", type: "folder", files: [".plaf", "hidden.txt"], hidden: true },
    "start/ref/hidden.txt": { name: "hidden.txt", type: "file", content: "some" },
    "start/ref/.plaf": { name: ".plaf", type: "file", ignored: true, content: "hidden: true" },
  };
  const ignored = 6;
  const fs = fakeFs(folders);
  const path = fakePath;
  const deps = { fs, path }


  // exec
  const output = crawl({ inputFolder: "start", outputFolder: "dfsf", deps });

  // assess
  const properties = Object.getOwnPropertyNames(folders);
  const mappedFolders = properties.map(propertyName => ({
    propertyName,
    matchingOutput: output.find(out => out.path === propertyName),
    folder: folders[propertyName]
  }));

  it("ignores ignored folders and files", () => {
    mappedFolders
      .filter(({ folder }) => folder.ignored)
      .forEach(({ matchingOutput }) => should(matchingOutput).be.undefined())
  })

  it("maps base properties for all files and folders that are not ignored", () => {
    mappedFolders
      .filter(({ folder }) => !folder.ignored)
      .forEach(({ propertyName, folder, matchingOutput }) => {
        should(matchingOutput).not.be.undefined();
        should(matchingOutput.type).eql(folder.expectedType || folder.type);
        should(matchingOutput.filename).eql(folder.name);
        if (!folder.targetRelativePath) {
          should(matchingOutput.relativePath).eql(propertyName.replace("start/", "").replace("start", ""));
        }
      })
  })

  it("scans folders", () => {
    mappedFolders
      .filter(({ folder }) => !folder.ignored && folder.type === "folder")
      .forEach(({ folder, matchingOutput }) => {
        should(matchingOutput.files).have.length(folder.files.filter(file => file[0] !== ".").length);
      })
  })

  it("loads folder templates", () => {
    mappedFolders
      .filter(({ folder }) => !folder.ignored && folder.type === "folder")
      .forEach(({ folder, matchingOutput }) => {
        const expected = folder.expectedTemplate || "index"
        should(matchingOutput.properties.template).eql(expected, `${folder.name} has template ${matchingOutput.properties.template} instead of ${expected}`);
      })
  })

  it("handles files in .plaf/resources folder", () => {
    mappedFolders
      .filter(({ folder }) => !folder.ignored && folder.targetRelativePath)
      .forEach(({ matchingOutput, folder }) => should(matchingOutput.relativePath).eql(folder.targetRelativePath))
  })

  it("handles files that should not be indexed", () => {
    mappedFolders
      .filter(({ folder }) => !folder.ignored)
      .forEach(({ matchingOutput, folder }) => {
        if (folder.skipIndexing) {
          should(matchingOutput.properties && matchingOutput.properties.skipIndexing).be.true(`${folder.name} should be skipped`)
        } else {
          should(matchingOutput.properties && matchingOutput.properties.skipIndexing).not.be.true();
        }
      })
  })

  it("handles files which should be hidden", () => {
    mappedFolders
      .filter(({ folder }) => !folder.ignored)
      .forEach(({ matchingOutput, folder }) => {
        if (folder.hidden) {
          should(matchingOutput.properties && matchingOutput.properties.hidden).be.true(`${folder.name} should be hidden`)
        } else {
          should(matchingOutput.properties && matchingOutput.properties.hidden).not.be.true();
        }
      })
  })

  it("does not fabricate files", () => {
    should(output).have.lengthOf(properties.length - ignored)
  })

})