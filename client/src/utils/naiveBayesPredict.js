export function predictCategory(tokens, model) {
  const { classes, priors, logProb, idf } = model;

  const termFreq = Object.create(null);
  tokens.forEach((t) => {
    termFreq[t] = (termFreq[t] || 0) + 1;
  });

  const scoresLog = {};
  classes.forEach((cls) => {
    let score = Math.log(priors[cls]);
    Object.entries(termFreq).forEach(([token, count]) => {
      const clsLogProb = logProb[cls][token];
      if (clsLogProb === undefined) return;
      const weight = count * (idf[token] || 1);
      score += weight * clsLogProb;
    });
    scoresLog[cls] = score;
  });

  const maxScore = Math.max(...Object.values(scoresLog));
  let sumExp = 0;
  const expScores = {};
  classes.forEach((cls) => {
    expScores[cls] = Math.exp(scoresLog[cls] - maxScore);
    sumExp += expScores[cls];
  });

  const scores = {};
  classes.forEach((cls) => {
    scores[cls] = expScores[cls] / sumExp;
  });

  const category = classes.reduce(
    (best, cls) => (scores[cls] > scores[best] ? cls : best),
    classes[0]
  );

  return { category, confidence: scores[category], scores };
}
