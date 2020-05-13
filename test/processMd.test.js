const should = require("should");
const td = require("testdouble");
const processMd = require("../src/processMd")
const mdExtensions = require("../src/mdExtensions")
const mdConvert = require("../src/mdConvert")
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
    const folderContent = [
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
    processMd({ folderContent, deps });
    mdConvert({ folderContent, deps })

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
    const folderContent = [
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
    processMd({ folderContent, deps });
    mdConvert({ folderContent, deps })

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
    const folderContent = [
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
    processMd({ folderContent, deps });

    // then
    should(mdFile.properties.tags).deepEqual(["toug", "tag", "another"]);
  });

  it("processes footnotes", () => {
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
    const folderContent = [
      mdFile,
      folder
    ];

    const content = "#toug title: This is title\ncat: category\n---\n-content-\n This is the[^1] content[^2].\n\n# notes\n\n[^1]: Footnote 1\n\n- [^2]: Footnote 2";
    const fakeFs = td.object(["readFileSync"]);
    td.when(fakeFs.readFileSync(mdFile.path)).thenReturn(content);
    const fakeMarked = (content) => `-${content}-`

    const deps = {
      marked: fakeMarked,
      fs: fakeFs
    }

    // when
    processMd({ folderContent, deps });
    mdExtensions({ folderContent, deps })
    mdConvert({ folderContent, deps })

    // then
    should(mdFile.content).containEql(`the<sup><a name="ref-1" href="#note-1">[1]</a></sup>`);
    should(mdFile.content).containEql(`content<sup><a name="ref-2" href="#note-2">[2]</a></sup>`);
    should(mdFile.content).containEql(`<a name="note-1" href="#ref-1">[1]</a>: Footnote 1`);
    should(mdFile.content).containEql(`<a name="note-2" href="#ref-2">[2]</a>: Footnote 2`);
  });
});