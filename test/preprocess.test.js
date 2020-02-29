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
    const crawled = [
      mdFile,
      txtFile,
      folder
    ];

    // when
    preprocess(crawled);

    // then
    should(mdFile.title).eql("markdown");
    should(txtFile.title).eql("text.txt");
    should(folder.title).eql("subfolder");
  });
});