const should = require("should")
const preprocess = require("../src/preprocess")
const consts = require("../src/consts");

describe("preprocess", () => {
  it("preprocesses items", () => {
    // prepare
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
    const rootfolder = {
      type: consts.fileType.folder,
      filename: 'rootfolder',
      path: 'start',
      relativePath: '',
      files: [folder]
    };
    const crawled = [
      mdFile,
      rootfolder,
      txtFile,
      folder
    ];

    // when
    preprocess({ folderContent: crawled, name: "new root title" });

    // then

    should(rootfolder.title).eql("new root title");
    should(mdFile.title).eql("markdown");
    should(mdFile.outputFilename).eql("markdown.html");
    should(txtFile.title).eql("text.txt");
    should(txtFile.outputFilename).eql("text.txt");
    should(folder.title).eql("subfolder");
  });
});