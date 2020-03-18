const should = require("should")
const td = require("testdouble")
const templateFactory = require("../src/templateFactory")
const fakePath = require("./fakePath");

describe("template factory", () => {
  // given
  const fakeFs = td.object(["existsSync", "readFileSync"]);
  const customTemplatePath = fakePath.join("templates", "custom.handlebars");
  const fullPathTemplatePath = fakePath.join("somewhere", "other-custom.handlebars");
  const customDefaultTemplatePath = fakePath.join("some.handlebars");
  const allPropertiesTemplatePath = fakePath.join("all.handlebars");
  const customDefaultInFolderPath = fakePath.join("custemplates", "default.handlebars");
  const unexistingTemplate = fakePath.join("templates", "blerh.handlebars")
  td.when(fakeFs.readFileSync(td.matchers.argThat(name => name.endsWith("src/default.handlebars")))).thenReturn("default")
  td.when(fakeFs.existsSync(customTemplatePath)).thenReturn(true)
  td.when(fakeFs.readFileSync(customTemplatePath)).thenReturn("custom")
  td.when(fakeFs.existsSync(fullPathTemplatePath)).thenReturn(true)
  td.when(fakeFs.readFileSync(fullPathTemplatePath)).thenReturn("custom2")
  td.when(fakeFs.existsSync(customDefaultTemplatePath)).thenReturn(true)
  td.when(fakeFs.readFileSync(customDefaultTemplatePath)).thenReturn("customDefault")
  td.when(fakeFs.existsSync(customDefaultInFolderPath)).thenReturn(true)
  td.when(fakeFs.readFileSync(customDefaultInFolderPath)).thenReturn("customDefault2")
  td.when(fakeFs.existsSync(allPropertiesTemplatePath)).thenReturn(true)
  td.when(fakeFs.readFileSync(allPropertiesTemplatePath)).thenReturn("{{{prop1}}}-{{{prop2}}}")
  td.when(fakeFs.existsSync(unexistingTemplate)).thenReturn(false);

  deps = {
    fs: fakeFs,
    path: fakePath
  }
  // when



  // then
  const getTemplate = templateFactory(undefined, "templates", deps)
  const customTemplate = getTemplate({ template: "custom" })({});
  it("loads templates from layout with no extension", () => should(customTemplate).eql("custom"));
  const customTemplateInProperties = getTemplate({ properties: { template: "custom" } })({});
  it("loads templates from properties", () => should(customTemplateInProperties).eql("custom"));
  const customTemplateWithExt = getTemplate({ template: "custom.handlebars" })({});
  it("loads templates from layout with extension", () => should(customTemplateWithExt).eql("custom"));
  const customFullPath = getTemplate({ template: fullPathTemplatePath })({});
  it("loads templates from fullpath", () => should(customFullPath).eql("custom2"));
  const defaultTemplate = getTemplate({})({});
  it("defaults to the default template", () => should(defaultTemplate).eql("default"));
  const getTemplateWithCustomDefault = templateFactory(customDefaultTemplatePath, "otherTemplates", deps);
  const customDefaultTemplate = getTemplateWithCustomDefault({})({})
  it("uses custom default template with full path", () => should(customDefaultTemplate).eql("customDefault"));
  const getTemplateWithCustomDefaultInFolder = templateFactory(undefined, "custemplates", deps);
  const customDefaultInFolderTemplate = getTemplateWithCustomDefaultInFolder({})({})
  it("uses default in templates folder", () => should(customDefaultInFolderTemplate).eql("customDefault2"));

  const getTemplateWithAllProperties = templateFactory(allPropertiesTemplatePath, "other", deps);
  const allPropertiesFlattened = getTemplateWithAllProperties({})({ prop1: "abc", properties: { prop2: "def" } })
  it("flattens all values of properties", () => should(allPropertiesFlattened).eql("abc-def"))

  const unexistingResult = getTemplate({ template: "blerh" })({})
  it("returns default if specified doesn't exist", () => should(unexistingResult).equal('default'));
});