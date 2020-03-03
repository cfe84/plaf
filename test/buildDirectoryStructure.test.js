const td = require("testdouble");
const consts = require("../src/consts");
const buildDirectoryStructure = require("../src/buildDirectoryStructure")
const fakePath = require("./fakePath")

describe("buildDirectoryStructure", () => {
  it("build the directory structure", () => {
    // prepare
    const file1 = {
      type: consts.fileType.md,
      path: 'start/markdown.md',
      relativePath: 'markdown.md',
      filename: 'markdown.md'
    };
    const rootFolder = {
      type: consts.fileType.folder,
      filename: 'start',
      path: 'start',
      relativePath: '',
      content: [file1]
    };
    const folder1 = {
      type: consts.fileType.folder,
      filename: 'subfolder',
      path: 'start/subfolder',
      relativePath: 'subfolder',
      content: [file1]
    };
    const crawled = [
      rootFolder,
      folder1,
      file1,
    ];

    const fakeFs = td.object(["mkdirSync"])
    const deps = {
      fs: fakeFs,
      path: fakePath
    }

    // exec
    buildDirectoryStructure("rendered", crawled, deps);

    // assess
    td.verify(fakeFs.mkdirSync("rendered/"), { times: 1 });
    td.verify(fakeFs.mkdirSync("rendered/subfolder"));
    td.verify(fakeFs.mkdirSync("rendered/markdown.md"), { times: 0 });
  })
});