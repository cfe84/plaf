const inMemoryFs = require("../src/inMemoryFs")


describe("inMemoryFs", () => {
  context("When writing to an empty fs", () => {
    const fs = inMemoryFs()

    // when
    fs.mkdirSync("root")
    fs.writeFileSync("root/rootfile.txt", "rootfile")
    fs.mkdirSync("root/folder")
    fs.writeFileSync("root/folder/file.txt", "file")

    // then
    it("lists the file and the folder", () => should(fs.readdirSync("root")).deepEqual(["rootfile.txt", "folder"]))
    it("throws not found on non existing folder", () => should(() => fs.readdirSync("notexistingfolder")).throw())
    it("reads the file", () => should(`${fs.readFileSync("root/rootfile.txt")}`).eql("rootfile"))
    it("throws not found on non existing file", () => {
      should(() => `${fs.readFileSync("root/nonexisting.txt")}`).throw()
      should(() => `${fs.lstatSync("root/nonexisting.txt")}`).throw()
    })
    it("reads a subfolder", () => should(fs.readdirSync("root/folder")).deepEqual(["file.txt"]))
    it("reads a file in subfolder", () => should(`${fs.readFileSync("root/folder/file.txt")}`).eql("file"))
    it("distincts directories from files", () => {
      should(fs.lstatSync("root/folder").isDirectory()).be.true()
      should(fs.lstatSync("root/folder/file.txt").isDirectory()).be.false()
    })
    it("knows if files exist", () => {
      should(fs.existsSync("root")).be.true()
      should(fs.existsSync("root/rootfile.txt")).be.true()
      should(fs.existsSync("not-existing")).be.false()
      should(fs.existsSync("root/not-existing.txt")).be.false()
    })
  })
  context("When starting with a couple files", () => {
    // given
    const fs = inMemoryFs()
    fs.mkdirSync("root")
    fs.writeFileSync("root/file.txt", "sdfs")

    // when
    fs.clear()

    it("should clear files and folder", () => {
      should(fs.existsSync("root")).be.false()
      should(fs.existsSync("root/file.txt")).be.false()
    })
  })
})