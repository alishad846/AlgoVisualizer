export function trainNaiveBayes(docsTokens, labels, { alpha = 1, maxVocabSize = 800 } = {}) {
  const classes = [...new Set(labels)];
  const N = docsTokens.length;

  const df = {};
  docsTokens.forEach((tokens) => {
    new Set(tokens).forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    });
  });

  const vocab = Object.keys(df)
    .sort((a, b) => df[b] - df[a])
    .slice(0, maxVocabSize);
  const vocabSet = new Set(vocab);

  const idf = {};
  vocab.forEach((t) => {
    idf[t] = Math.log(N / (1 + df[t])) + 1;
  });

  const priors = {};
  classes.forEach((cls) => {
    priors[cls] = labels.filter((l) => l === cls).length / N;
  });

  const termWeight = {};
  const totalWeight = {};
  classes.forEach((cls) => {
    termWeight[cls] = {};
    totalWeight[cls] = 0;
  });

  docsTokens.forEach((tokens, i) => {
    const cls = labels[i];
    const counts = {};
    tokens.forEach((t) => {
      if (!vocabSet.has(t)) return;
      counts[t] = (counts[t] || 0) + 1;
    });
    Object.entries(counts).forEach(([token, count]) => {
      const weight = count * idf[token];
      termWeight[cls][token] = (termWeight[cls][token] || 0) + weight;
      totalWeight[cls] += weight;
    });
  });

  const logProb = {};
  classes.forEach((cls) => {
    logProb[cls] = {};
    vocab.forEach((token) => {
      const w = termWeight[cls][token] || 0;
      logProb[cls][token] = Math.log((w + alpha) / (totalWeight[cls] + alpha * vocab.length));
    });
  });

  return { classes, priors, logProb, idf, vocab };
}
