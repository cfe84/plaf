const should = require("should");
const td = require("testdouble")
const consts = require("../src/consts")
const lex = require("../src/search/lex")
const cataloger = require("../src/search/cataloger");
const createSearch = require("../src/search/createSearch")
const renderSearch = require("../src/search/renderSearch")
const fakePath = require("./fakePath");

describe("search", () => {
  context("should lex", () => {
    // given
    const content = "This stuff is cool. <b>Bold!</b>. **emPHASized**!! \n the jix-6 is so_cool \n## title.\n And a #tag. Cool";

    // when
    const lexems = lex(content);

    // then
    it("lexes words, in lowercase", () => {
      should(lexems).containEql("this");
      should(lexems).containEql("stuff");
      should(lexems).containEql("cool");
    })
    it("discards html tags", () => {
      should(lexems).not.containEql("b");
    })
    it("lexes formatted words", () => {
      should(lexems).containEql("bold");
      should(lexems).containEql("emphasized");
      should(lexems).containEql("title");
      should(lexems).containEql("tag");
    })
    it("lexes dashes and underscores", () => {
      should(lexems).containEql("jix-6");
      should(lexems).containEql("so_cool");
    })
    it("should lex words only once", () => {
      should(lexems.filter(lex => lex === "cool")).have.length(1)
    })
  })


  context("should catalog", () => {
    // given
    const file1 = { title: "file1", type: consts.fileType.md, relativePath: "path/file1.md", mdcontent: "file1" }
    const file2 = { title: "file2", type: consts.fileType.md, relativePath: "path/file2.md", mdcontent: "file2" }
    const file3 = { title: "file3", type: consts.fileType.md, relativePath: "path/file3.md", mdcontent: "file3" }
    const file4 = { title: "file4", type: consts.fileType.file, relativePath: "path/file4.txt", mdcontent: "file4" }
    const fakeLex = td.object("lex");
    td.when(fakeLex.lex("file1")).thenReturn(["a", "b"])
    td.when(fakeLex.lex("file2")).thenReturn(["b", "c"])
    td.when(fakeLex.lex("file3")).thenReturn(["a", "c", "d"])

    // when
    const catalog = cataloger([file1, file2, file3, file4], fakeLex.lex)

    // then
    const validate = (lex, arr) => {
      should(catalog[lex]).have.length(arr.length);
      arr.forEach(elt => should(catalog[lex]).matchAny(cataloged => cataloged.title === elt.title && cataloged.path === elt.relativePath.replace("md", "html")))
    }
    validate("a", [file1, file3])
    validate("b", [file1, file2])
    validate("c", [file2, file3])
    validate("d", [file3])
    td.verify(fakeLex.lex("file4"), { times: 0 })
  });

  context("should search using catalog", () => {
    // given
    const file1 = { title: "file1", path: "path/file1.html" }
    const file2 = { title: "file2", path: "path/file2.html" }
    const file3 = { title: "file3", path: "path/file3.html" }
    const catalog = {
      "abstract": [file1, file2],
      "bilbao": [file2, file3],
      "tract": [file1, file3],
      "truck": [file1]
    }

    // when
    const search = createSearch(catalog);
    const abstractResults = search(["abstract"]);
    const tractResults = search(["tract"]);
    const baobabResults = search(["baobab"]);
    const abstractBilbaoResults = search(["abstract", "bilbao"])
    const abstBaoResults = search(["abstract", "bao"]);
    const bilbaoTruckResults = search(["bil", "truck"])

    // then
    it("should match exact words", () => {
      should(abstractResults).have.length(2);
      should(abstractResults).matchAny(res => res.file === file1 && res.score === 1, "should match two results but for one word with score 1")
      should(abstractResults).matchAny(res => res.file === file2 && res.score === 1)
      should(abstractBilbaoResults).have.length(1)
      should(abstractBilbaoResults[0]).match(res => res.file === file2 && res.score === 1, "should match two words and give score 1")
    })
    it("should match files only once with the largest score", () => {
      should(tractResults).have.length(3);
      should(tractResults).matchAny(res => res.file === file1 && res.score === 1)
    })
    it("should match partial words", () => {
      should(tractResults).matchAny(res => res.file === file3 && res.score === 1)
      should(tractResults).matchAny(res => res.file === file2 && res.score === .625)
      should(abstBaoResults).matchAny(res => res.file === file2 && res.score === .75, "should average results")
    })
    it("should return empty results for no match", () => {
      should(baobabResults).have.length(0)
      should(bilbaoTruckResults).have.length(0)
    })
  });

  context("renders search script", () => {
    // given
    const catalog = "THIS IS CATALOG";
    const outputFolder = "folder";
    const fakeFs = td.object(["writeFileSync", "readFileSync"]);
    td.when(fakeFs.readFileSync(td.matchers.contains("search/createSearch.js"))).thenReturn("THIS IS SEARCH\nmodule.exports");
    deps = {
      path: fakePath,
      fs: fakeFs
    }

    // when
    renderSearch(catalog, outputFolder, deps);

    // then
    td.verify(fakeFs.writeFileSync(fakePath.join(outputFolder, "search.js"),
      td.matchers.argThat(arg => arg.indexOf("THIS IS CATALOG") >= 0 && arg.indexOf("THIS IS SEARCH") >= 0 && arg.indexOf("module.exports") < 0)))
  })
})