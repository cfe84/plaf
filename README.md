plaf is a markdown static website generator. It only expects you to write documents in markdown, with minimal profile. Use your own folder structure, your own file names, your own style with [handlebars](https://handlebarsjs.com/) templates. No config files. No conventions. 

## How does it work?

**Step 0.**: Install plaf (you need [nodejs](https://www.nodejs.org) for that.)

```sh
npm i -g plaf
```

**Step 1.** Go to the folder containing markdown files.

```sh
cd ~/my-folder
```

**Step 2.** Run plaf

```sh
plaf
```

**Step 3.** Success. You static website is in the `rendered` directory.

## What else can I do?

**Specify which folder to render, and where to output**

Use `--in` (or `-i`) to specify the input folder.

Use `--out` (or `-o`) to specify the output folder. **THE CONTENT OF THE OUTPUT FOLDER WILL BE WIPED BEFORE RENDERING, MAKE SURE YOU'RE OK WITH THAT**.

**Use templates**

Use your own templates using [handlebars](https://handlebarsjs.com) syntax. The content goes into a `content` variable. The title goes into a `title` variable. [This is an example](https://github.com/cfe84/plaf/blob/master/src/default.handlebars) of what a template looks like:

```html
<html>

<head>
  <title>{{title}}</title>

<body>
  <header>
    <div class="site-title">
      {{title}}
    </div>
  </header>
  <div>{{{content}}}</div>
</body>

</html>
```

To use a template, specify the `--template` (or `-t`) option to plaf, and point to the handlebars file.

**Your own variables**

Plaf supports yaml headers on your markdown files. Add this to your markdown file:


```md
---
title: This is the title
category: bla
---

This is the body
```

By default it's using your file names as title. You can override that with the headers. You can add all the headers you want, and use them as variables in your templates. Plaf also sends its internal values to the template, if you want to use them, including:

- `title`
- `type`: `md` for markdown files, `folder` for folders.
- `content` and `mdcontent`: the content.
- `path`, `relativePath`: files paths
- `tags`: a list of tags for md files
- `files`: a list of `files` contained in the folder or tag. These files have the same properties.

**Customize templates per file**

If you add a `template` property to your markdown headers, and set the value to the path of the file you want to use as a template.

**Create a template library**

Create a `.plaf` folder at the root of your markdown folder, and add template files to this folder. Then, from the markdown files, you can refer to these using only their names rather than their path. Plaf uses the `.handlebars` as default for the templates, so if you have a `.plaf/blog-post.handlebars` template file, then your header can be:

```md
---
title: This is a blog post
template: blog-post
---
```

You can point to another template library by using the `--templates` (or `-T`) option.

Plaf uses `default.handlebars` by default, and `index.handlebars` for indexes, and `tags.handlebars` for tags index.

**Create your custom index**

If you don't want to use a list of the markdown files in the directory but use your own index instead, create an `index.md` or a `index.html` file in the directory, and plaf will use that instead.

**Use tags**

If you use tags in your md files, then plaf will use them and generate a tags index.

**Copy resource files**

If you create a `.plaf/resources` directory, plaf will copy everything from it to the render directory, and will not index it. This is useful if you want to include things like fonts or CSS.

**Configure sub folders**

Add a `.plaf` file in a folder. Give it properties the same way you would a file. This way, you can specify a custom template for a given index.