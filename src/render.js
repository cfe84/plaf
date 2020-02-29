const marked = require("marked");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars")

const TYPE_FOLDER = "folder";
const TYPE_MD = "md";
const TYPE_FILE = "file";
const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm

const render = (inputFolder, outputFolder, defaultTemplate) => {

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

  const copyFile = (input, output) => {
    fs.copyFileSync(input, output)
  }

  const rmFolder = (folder) => {
    const files = fs.readdirSync(folder);
    files.forEach(file => {
      const fullpath = path.join(folder, file)
      const stats = fs.lstatSync(fullpath);
      if (stats.isDirectory()) {
        rmFolder(fullpath);
      } else {
        fs.unlinkSync(fullpath)
      }
    })
    fs.rmdirSync(folder)
  }

  const generateIndex = (folder, content) => {
    const list = content
      .filter(f => f.type !== TYPE_FILE)
      .sort((f1, f2) => f1.name > f2.name ? -1 : 1)
      .sort(f => f.type === TYPE_FOLDER ? -1 : 1)
      .map(item => `<li class="item-${item.type}"><a href="${item.file + (item.type === TYPE_FOLDER ? "/index.html" : "")}">${item.title}</a></li>`)
      .join("\n");
    const template = handlebars.compile(defaultTemplate);
    const indexContent = template({
      title: folder,
      content: `<ul class="post-list">${list}</ul>`
    });
    fs.writeFileSync(path.join(folder, "index.html"), indexContent)
  }

  const tagCollector = () => {
    const collection = {};
    return {
      collectTags: (tags, path) => {
        tags.forEach((tag) => {
          if (!collection[tag]) {
            collection[tag] = [];
          }
          collection[tag].push(path);
        });
      },
      collection
    }
  }

  function isIgnored(file) {
    return file === ".git"
      || file === ".gitignore"
      || file === "z_tools"
      || file === outputFolder
  }

  const parseFolder = (inputFolder) => {
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
        const content = parseFolder(filePath);
        return {
          type: TYPE_FOLDER,
          name: file,
          file: file,
          title: path.basename(file),
          content
        }
      } else if (path.extname(file) === ".md") {
        const res = renderMd(filePath)
        return {
          type: TYPE_MD,
          rendered: res.rendered,
          title: res.title,
          tags: res.tags,
          file: path.basename(res.file),
          name: file
        }
      } else {
        return {
          type: TYPE_FILE,
          path: filePath,
          name: file
        }
      }
    })
      .filter(file => file.type !== "ignore");
    return res;
  }

  const outputToFolder = (folderContent, outputFolder, collectTags) => {
    if (fs.existsSync(outputFolder)) {
      rmFolder(outputFolder);
    }
    fs.mkdirSync(outputFolder);
    generateIndex(outputFolder, folderContent);
    folderContent.forEach(file => {
      const filePath = path.join(outputFolder, file.name)
      if (file.type === TYPE_FOLDER) {
        outputToFolder(file.content, filePath, collectTags);
      }
      if (file.type === TYPE_FILE) {
        copyFile(file.path, filePath);
      }
      if (file.type === TYPE_MD) {
        const htmlFilePath = filePath.substring(0, filePath.length - 3) + ".html";
        collectTags(file.tags, htmlFilePath);
        fs.writeFileSync(htmlFilePath, file.rendered);
      }
    })
  }
  const folderContent = parseFolder(inputFolder);
  const collector = tagCollector();
  outputToFolder(folderContent, outputFolder, collector.collectTags);
}

module.exports = render;