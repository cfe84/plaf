const lexRegex = /((?!<.)[a-z0-9_-]+(?!>.))/gi

const lex = (content) => {
  const matches = content
    .match(lexRegex)
  return matches ? matches
    .map(item => item.toLowerCase())
    .filter((val, index, self) => self.indexOf(val, index + 1) < 0)
    : []
}

module.exports = lex;