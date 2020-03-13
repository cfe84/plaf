const consts = require("../src/consts");
const td = require("testdouble");
const copyFiles = require("../src/copyFiles")
const fakePath = require("./fakePath")

describe("copyFiles", () => {
  it("copies files", () => {
    // given
    const mdFile = {
      type: consts.fileType.md,
      path: 'start/markdown.md',
      relativePath: 'markdown.md',
      filename: 'markdown.md'
    };
    const txtFile = {
      type: consts.fileType.file,
      path: 'start/text.txt',
      relativePath: 'text.txt',
      filename: 'text.txt'
    };
    const folder = {
      type: consts.fileType.folder,
      filename: 'subfolder',
      path: 'start/subfolder',
      relativePath: 'subfolder',
      files: [mdFile, txtFile]
    };
    const crawled = [
      mdFile,
      txtFile,
      folder
    ];

    const fakeFs = td.object(["copyFileSync"]);
    deps = {
      path: fakePath,
      fs: fakeFs
    }
    const outputDirectory = "out-123"

    // when
    copyFiles(crawled, outputDirectory, deps)

    // then
    td.verify(fakeFs.copyFileSync(txtFile.path, fakePath.join(outputDirectory, txtFile.relativePath)));
    td.verify(fakeFs.copyFileSync(mdFile.path, fakePath.join(outputDirectory, mdFile.relativePath)), { times: 0 })
  })
});