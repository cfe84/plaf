const should = require("should");
const td = require("testdouble");
const processMd = require("../src/processMd")
const consts = require("../src/consts");

describe("process markdown", () => {
  it("processes markdown", () => {
    // prepare
    const mdFile = {
      type: consts.fileType.md,
      path: 'start/markdown.md',
      relativePath: 'markdown.md',
      filename: 'markdown.md',
      title: 'markdown.md'
    };
    const mdFileWithTag = {
      type: consts.fileType.md,
      path: 'start/markdown-with-tag.md',
      relativePath: 'markdown-with-tag.md',
      filename: 'markdown-with-tag.md',
      title: 'markdown-with-tag.md'
    };
    const txtFile = {
      type: consts.fileType.file,
      path: 'start/text.txt',
      relativePath: 'text.txt',
      filename: 'text.txt',
      title: 'text.txt'
    };
    const folder = {
      type: consts.fileType.folder,
      filename: 'subfolder',
      path: 'start/subfolder',
      relativePath: 'subfolder',
      title: 'subfolder',
      files: [mdFile, txtFile]
    };
    const crawled = [
      mdFile,
      txtFile,
      folder
    ];

    const fakeFs = td.object(["readFileSync"]);
    td.when(fakeFs.readFileSync(mdFile.path)).thenReturn("---\ntitle: This is title\nsomething: \"in quotes\"\ncat: category\ncats: [123,456]---\n-content-");
    const fakeMarked = td.object(["marked"]);
    td.when(fakeMarked.marked("-content-")).thenReturn("marked-content");

    const deps = {
      marked: fakeMarked.marked,
      fs: fakeFs
    }

    // when
    processMd(crawled, deps);

    // then
    should(mdFile.title).eql("This is title");
    should(mdFile.properties.cat).eql("category")
    should(mdFile.properties.something).eql("in quotes");
    should(mdFile.properties.cats).deepEqual([123, 456]);
    should(mdFile.content).eql("marked-content");
    should(txtFile.content).be.undefined()
  });

  it("processes markdown with no headers", () => {
    // prepare
    const mdFile = {
      type: consts.fileType.md,
      path: 'start/markdown.md',
      relativePath: 'markdown.md',
      filename: 'markdown.md',
      title: 'markdown'
    };

    const folder = {
      type: consts.fileType.folder,
      filename: 'subfolder',
      path: 'start/subfolder',
      relativePath: 'subfolder',
      title: 'subfolder',
      content: [mdFile]
    };
    const crawled = [
      mdFile,
      folder
    ];

    const content = "title: This is title\ncat: category\n---\n-content-";
    const fakeFs = td.object(["readFileSync"]);
    td.when(fakeFs.readFileSync(mdFile.path)).thenReturn(content);
    const fakeMarked = td.object(["marked"]);

    const deps = {
      marked: fakeMarked.marked,
      fs: fakeFs
    }

    // when
    processMd(crawled, deps);

    // then
    td.verify(fakeMarked.marked(content));
    should(mdFile.title).eql("markdown");
  });

  it("processes markdown with tags", () => {
    // prepare
    const mdFile = {
      type: consts.fileType.md,
      path: 'start/markdown.md',
      relativePath: 'markdown.md',
      filename: 'markdown.md',
      title: 'markdown'
    };

    const folder = {
      type: consts.fileType.folder,
      filename: 'subfolder',
      path: 'start/subfolder',
      relativePath: 'subfolder',
      title: 'subfolder',
      content: [mdFile]
    };
    const crawled = [
      mdFile,
      folder
    ];

    const content = "#toug title: This is title\ncat: category\n---\n-content-\n This is #tag and #another tag.";
    const fakeFs = td.object(["readFileSync"]);
    td.when(fakeFs.readFileSync(mdFile.path)).thenReturn(content);
    const fakeMarked = td.object(["marked"]);

    const deps = {
      marked: fakeMarked.marked,
      fs: fakeFs
    }

    // when
    processMd(crawled, deps);

    // then
    should(mdFile.properties.tags).deepEqual(["toug", "tag", "another"]);
  });
});