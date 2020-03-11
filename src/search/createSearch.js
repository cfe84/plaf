const s = (catalog) => {
  const cat = Object.getOwnPropertyNames(catalog).map(key => ({
    key,
    matches: catalog[key]
  })
  );
  const searchTerm = (term) => cat.map(entry => ({
    score: entry.key.indexOf(term.toLowerCase()) >= 0 ? term.length / entry.key.length : 0,
    matches: entry.matches
  }))
    .filter(entry => entry.score > 0)
    .map(entry => entry.matches.map(match => ({
      score: entry.score,
      file: match
    })))
    .reduce((arr, entries) => arr.concat(entries), [])
    .sort(entry => -entry.score)
    .filter((val, index, self) => self.find((elt, idx) => elt.file.path === val.file.path && idx < index) === undefined)
  const searchTerms = (terms) => terms
    .map(searchTerm);
  const keepOnlyCommonResults = (results, terms) => {
    let finalResult = results[0];
    for (let i = 1; i < results.length; i++) {
      finalResult = finalResult.map(result => {
        const correspondingResult = results[i].find(res => res.file.path === result.file.path)
        return correspondingResult ? {
          file: result.file,
          score: result.score + correspondingResult.score
        } : null
      })
        .filter(result => result !== null);
    }
    return finalResult.map(res => ({
      file: res.file,
      score: res.score / terms.length
    }))
  }
  return (terms) => keepOnlyCommonResults(searchTerms(terms), terms)
}

module.exports = s;