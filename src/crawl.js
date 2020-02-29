const marked = require("marked");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars")
const consts = require("./consts");

const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm


const crawl = (inputFolder, outputFolder, defaultTemplate) => {

  const fixMdLinks = (content) => {
    const regex = /.md(#\w+)?\)/g
    return content.replace(regex, ".html$1)");
  }

  const replaceRefs = (content) => {
    const referenceRegex = /\s*\((\[ref\]\([^)]+\))\)/g
    return content
      .replace(referenceRegex, `<sup>$1</sup>`)
  }

  const replaceFootNotes = (content) => {
    const notesRegex = /(?:\s|^)\[\^(\d+)\]\s*:/g
    const referenceRegex = /(\S)\[\^(\d+)\]/g
    return content
      .replace(notesRegex, ` <a name="note-$1" href="#ref-$1">[$1]</a>: `)
      .replace(referenceRegex, `$1<sup><a name="ref-$2" href="#note-$2">[$2]</a></sup>`)
  }

  const replaceTags = (content) => {
    return content.replace(tagRegex, `$1<a href="/tags/$2.html">#$2</a>`);
  }

  const parseContent = (content) => {
    const headerStartLineIndex = content.indexOf("---\n");
    if (headerStartLineIndex < 0) {
      return { content };
    }
    const headerFinishLineIndex = content.indexOf("---\n", headerStartLineIndex + 3);
    if (headerFinishLineIndex < 0) {
      return { content };
    }
    const headerContent = content.substring(headerStartLineIndex + 4, headerFinishLineIndex).trim();
    const onlyContent = content.substring(headerFinishLineIndex + 4).trim();
    const headerRegex = /^([^:]+)\s*:\s*(.*)/;
    const headers = headerContent
      .split("\n")
      .map(line => {
        const matches = headerRegex.exec(line);
        return {
          key: matches[1],
          value: matches[2]
        }
      })
      .reduce((aggregatedObject, line) => { aggregatedObject[line.key] = line.value; return aggregatedObject }, {});
    const tagMatches = onlyContent.match(tagRegex);
    const tags = tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
    const res = {
      content: onlyContent,
      headers: headers,
      tags
    }
    return res;
  }

  const loadTemplate = (headers) => {
    if (headers && headers.template && fs.existsSync(headers.template)) {
      return fs.readFileSync(headers.template);
    } else {
      return defaultTemplate
    }
  }


  const renderMd = (file) => {
    const content = `${fs.readFileSync(file)}`;
    const parsedContent = parseContent(content);
    const rendered = marked(fixMdLinks(replaceRefs(replaceTags(replaceFootNotes(parsedContent.content)))));
    const template = loadTemplate(parsedContent.headers);

    const formatter = handlebars.compile(template);
    const values = parsedContent.headers || {};
    if (!values.title)
      values.title = path.basename(file).replace(".md", "");
    values.content = rendered;
    result = formatter(values)
    return {
      rendered: result,
      title: values.title,
      file: file.substring(0, file.length - 3) + ".html",
      tags: parsedContent.tags || []
    };
  }

  function isIgnored(file) {
    return file === ".git"
      || file === ".gitignore"
      || file === "z_tools"
      || file === outputFolder
  }

  const crawlFolder = (inputFolder) => {
    const files = fs.readdirSync(inputFolder);
    const res = files.map(file => {
      if (isIgnored(file)) {
        return {
          type: "ignore"
        }
      }
      const filePath = path.join(inputFolder, file)
      const stats = fs.lstatSync(filePath);
      if (stats.isDirectory()) {
        const content = crawlFolder(filePath);
        return {
          type: consts.fileType.folder,
          name: file,
          file: file,
          title: path.basename(file),
          content
        }
      } else if (path.extname(file) === ".md") {
        const res = renderMd(filePath)
        return {
          type: consts.fileType.md,
          rendered: res.rendered,
          title: res.title,
          tags: res.tags,
          file: path.basename(res.file),
          name: file
        }
      } else {
        return {
          type: consts.fileType.file,
          path: filePath,
          name: file
        }
      }
    })
      .filter(file => file.type !== "ignore");
    return res;
  }

  const folderContent = crawlFolder(inputFolder);

  return folderContent;
}

module.exports = crawl;