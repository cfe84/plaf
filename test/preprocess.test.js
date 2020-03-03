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
      content: [mdFile, txtFile]
    };
    const rootfolder = {
      type: consts.fileType.folder,
      filename: 'rootfolder',
      path: 'start',
      relativePath: '',
      content: [folder]
    };
    const crawled = [
      mdFile,
      rootfolder,
      txtFile,
      folder
    ];

    // when
    preprocess(crawled, "new root title");

    // then

    should(rootfolder.title).eql("new root title");
    should(mdFile.title).eql("markdown");
    should(txtFile.title).eql("text.txt");
    should(folder.title).eql("subfolder");
  });
});