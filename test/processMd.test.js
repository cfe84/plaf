const should = require("should");
const td = require("testdouble");
const processMd = require("../src/processMd")
const mdExtensions = require("../src/mdExtensions")
const mdWikiLinks = require("../src/mdWikiLinks")
const mdConvert = require("../src/mdConvert")
const consts = require("../src/consts");

describe("process markdown", () => {
  [{ name: "lf", eol: "\n" },
  { name: "crlf", eol: "\r\n" }].forEach(param => {
    it(`processes markdown with ${param.name}`, () => {
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
      td.when(fakeFs.readFileSync(mdFile.path)).thenReturn(`---${param.eol}title: This is title${param.eol}something: \"in quotes\"${param.eol}cat: category${param.eol}cats: [123,456]---${param.eol}-content-`);
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
  })

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
    mdExtensions({ folderContent, deps })

    // then
    should(mdFile.properties.tags).deepEqual(["toug", "tag", "another"]);
  });

  it("should convert custom md extensions", () => {
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

    const content = "#toug title: This is title\ncat: category\n---\n-content-\n This is the[^1] content[^2]. It has " +
      "some refs ([ref](http://something.com)).\n\n# notes\n\n[^1]: Footnote 1\n\n- [^2]: Footnote 2\n\n" +
      "Small --> <-> <-- arrows and big ==> <=> <== arrows. En -- and Em --- dashes. Left << and right >>.\n\n" +
      "-- works but doesnt break this-- that--, --that that--one and that--- or that---one but this works ---"
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
    should(mdFile.content).containEql(`some refs<sup>[ref](http://something.com)</sup>`);
    should(mdFile.content).containEql(`Small &rarr; &harr; &larr; arrows and big &rArr; &hArr; &lArr; arrows`);
    should(mdFile.content).containEql(`En &ndash; and Em &mdash; dashes.`);
    should(mdFile.content).containEql(`Left &laquo; and right &raquo;.`);
    should(mdFile.content).containEql(`&ndash; works but doesnt break this-- that--, --that that--one and that--- or that---one but this works &mdash;`);
  });

  it("should convert wikilinks", () => {
    // prepare
    const mdFile = {
      type: consts.fileType.md,
      path: 'start/markdown.md',
      relativePath: 'markdown.md',
      filename: 'markdown.md',
      title: 'markdown'
    };

    const file1 = {
      type: consts.fileType.md,
      path: 'start/ref/file-1.md',
      relativePath: 'ref/file-1.md',
      filename: 'file-1.md',
      title: 'FILE_1'
    };

    const file2 = {
      type: consts.fileType.md,
      path: 'start/ref/file-2.md',
      relativePath: 'ref/file-2.md',
      filename: 'FILE-2.md',
      title: 'FILE_2'
    };

    const folder = {
      type: consts.fileType.folder,
      filename: 'subfolder',
      path: 'start/subfolder',
      relativePath: 'subfolder',
      title: 'subfolder',
      content: [mdFile]
    };

    const reffolder = {
      type: consts.fileType.folder,
      filename: 'subfolder',
      path: 'start/ref',
      relativePath: 'ref',
      title: 'ref',
      content: [file1, file2]
    };

    const folderContent = [
      mdFile,
      folder,
      reffolder,
      file1,
      file2
    ];

    const content = "This is the [[file-1]] and this is the [[file 2]].\n\n" +
      "Also you can use [[file-1|labels]], and it leaves [[incorrect]] links untouched.\n\n" +
      "It also supports [[#tags]] links";
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
    mdWikiLinks({ folderContent, deps })
    mdConvert({ folderContent, deps })

    // then
    should(mdFile.content).containEql(`<a href="/ref/file-1.html">FILE_1</a>`);
    should(mdFile.content).containEql(`<a href="/ref/file-2.html">FILE_2</a>`);
    should(mdFile.content).containEql(`<a href="/ref/file-1.html">labels</a>`);
    should(mdFile.content).containEql(`<a href="/tags/tags.html">tags</a>`);
    should(mdFile.content).containEql(`[[incorrect]]`);
  });

  it("should not convert special characters when deactivated at the file level", () => {
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

    const content = "---\ntitle: This is title\ncat: category\nspecialCharacters: false---\n-content-\n This is the[^1] content[^2]. It has " +
      "some refs ([ref](http://something.com)).\n\n# notes\n\n[^1]: Footnote 1\n\n- [^2]: Footnote 2\n\n" +
      "Small --> <-> <-- arrows and big ==> <=> <== arrows. En -- and Em --- dashes.";
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
    should(mdFile.content).containEql(`some refs<sup>[ref](http://something.com)</sup>`);
    should(mdFile.content).containEql(`Small --> <-> <-- arrows and big ==> <=> <== arrows. En -- and Em --- dashes.`);
  });
});