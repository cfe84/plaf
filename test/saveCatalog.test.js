const td = require("testdouble")
const consts = require("../src/consts")
const saveCatalog = require("../src/saveCatalog")
const fakePath = require("./fakePath");

describe("save catalog", () => {

  // given
  const file1 = { title: "file1", type: consts.fileType.md, relativePath: "path/file1.md", mdcontent: "file1" }
  const file2 = { title: "file2", type: consts.fileType.md, relativePath: "path/file2.md", mdcontent: "file2" }
  const file3 = { title: "file3", type: consts.fileType.md, relativePath: "path/file3.md", mdcontent: "file3" }
  const file4 = { title: "file4", type: consts.fileType.file, relativePath: "path/file4.txt", mdcontent: "file4" }
  const fakeFs = td.object("writeFileSync");
  const deps = {
    path: fakePath,
    fs: fakeFs
  }

  // when
  saveCatalog([file1, file2, file3, file4], "output", deps)

  // then
  it("saves md in catalog, as path in HTML", () => { td.verify(fakeFs.writeFileSync(fakePath.join("output", "search", "catalog.js"), td.matchers.contains("path/file3.html"))); })
  it("skips other files", () => {
    td.verify(fakeFs.writeFileSync(fakePath.join("output", "search", "catalog.js"), td.matchers.contains("path/file4.txt")), { times: 0 });
  });

})