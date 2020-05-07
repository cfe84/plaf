const consts = require("./consts");
const generateTags = ({ folderContent, outputFolder, deps }) => {
  const getTags = (content) =>
    content
      .filter(file => !!file.properties.tags)
      .map(file => file.properties.tags)
      .reduce((res, tags) => res.concat(tags), [])
      .filter((item, pos, self) => self.indexOf(item) === pos)
      .sort()
  const mdFiles =
    folderContent
      .filter(file => file.type === consts.fileType.md)
  let tags = getTags(mdFiles);
  deps.fs.mkdirSync(deps.path.join(outputFolder, "tags"));
  const template = deps.getTemplate({ properties: { template: "index" } })
  tags = tags.map(tagname => ({
    tag: tagname,
    title: tagname,
    relativePath: deps.path.join("tags", tagname + ".html"),
    type: "tag",
    files: mdFiles.filter(item => item.properties && item.properties.tags && item.properties.tags.indexOf(tagname) >= 0)
  })
  );
  tags.forEach(tag => {
    const formattedItems = tag.files
      .map(item => `<li class="item-md"><a href="../${item.relativePath.replace(/\.md$/i, ".html")}">${item.properties.title}</a></li>`)
      .join("\n");
    tag.content = `<ul class="post-list">${formattedItems}</ul>`
    const rendered = template(tag);
    deps.fs.writeFileSync(deps.path.join(outputFolder, tag.relativePath), rendered);
  })
  tags = tags.sort((a, b) => a.files.length > b.files.length ? -1 : 1)
  const formattedTags = tags.map(tag => `<li class="item-md"><a href="${tag.tag}.html">${tag.title} (${tag.files.length})</a></li>`).join("\n");
  const tagIndex = {
    title: "Tags",
    properties: { template: "tags" },
    content: `<ul class="post-list">${formattedTags}</ul>`,
    type: "tags",
    files: tags
  }
  const indexTemplate = deps.getTemplate(tagIndex)
  const renderedTags = indexTemplate(tagIndex)
  deps.fs.writeFileSync(deps.path.join(outputFolder, "tags", "index.html"), renderedTags)
};

module.exports = generateTags