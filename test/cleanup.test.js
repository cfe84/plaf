const td = require("testdouble");
const cleanup = require("../src/cleanup")
const fakePath = require("./fakePath")

describe("cleanup", () => {
  it("cleans the directory", () => {
    // prepare
    const createFakeLstat = (isDir) => {
      const lstat = td.object(["isDirectory"]);
      td.when(lstat.isDirectory()).thenReturn(isDir)
      return lstat;
    }
    const fakeFs = td.object(["readdirSync", "lstatSync", "unlinkSync", "rmdirSync"]);

    const files = [
      "start/folder/markdown.md",
      "start/folder/.hidden.md",
      "start/folder/subfolder/anotherfile.md",
    ]

    const folders = [
      { name: "start/folder", files: ["markdown.md", ".hidden.md", "subfolder"] },
      { name: "start/folder/subfolder", files: ["anotherfile.md", "subsubfolder"] },
      { name: "start/folder/subfolder/subsubfolder", files: [] }
    ]
    files.forEach(file => td.when(fakeFs.lstatSync(file)).thenReturn(createFakeLstat(false)));
    folders.forEach(folder => td.when(fakeFs.lstatSync(folder.name)).thenReturn(createFakeLstat(true)));
    folders.forEach(folder => td.when(fakeFs.readdirSync(folder.name)).thenReturn(folder.files));

    td.when(fakeFs.lstatSync("start/file.md")).thenReturn(createFakeLstat(false));
    td.when(fakeFs.readdirSync("start")).thenReturn(["file.md", "start/folder"]);
    const deps = {
      fs: fakeFs,
      path: fakePath
    }

    // when
    cleanup("start/folder", deps)

    //then
    td.verify(fakeFs.unlinkSync("start/file.txt"), { times: 0 })
    td.verify(fakeFs.rmdirSync("start"), { times: 0 })
    files.forEach(file => td.verify(fakeFs.unlinkSync(file), { times: 1 }))
    folders.forEach(folder => td.verify(fakeFs.rmdirSync(folder.name)))
  })
})