const fakePath = {
  join: (...args) => args.join("/").replace("//", "/"),
  extname: (file) => {
    const splat = file.split(".");
    return "." + splat[splat.length - 1]
  },
  basename: (file) => {
    const splat = file.split("/");
    return splat[splat.length - 1]
  }
}

module.exports = fakePath