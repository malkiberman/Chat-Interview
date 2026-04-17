function calculateFinalScore(scores, weights) {
  if (!Array.isArray(scores) || !Array.isArray(weights)) {
    throw new Error("Both scores and weights must be arrays.");
  }

  const length = Math.min(scores.length, weights.length);
  let finalScore = 0;

  for (let i = 0; i < length; i += 1) {
    const score = scores[i];
    const weight = weights[i];

    if (weight === 100) {
        if(score === 0 || score === null || score === undefined)
            return 0;
     continue;
    }

    if (score === null || score === undefined) {
      continue;
    }

    const numericScore = Number(score);
    const numericWeight = Number(weight);
    if (Number.isNaN(numericScore) || Number.isNaN(numericWeight)) {
      continue;
    }

    finalScore += numericScore * (numericWeight / 100);
  }

  return finalScore;
}

module.exports = {
  calculateFinalScore,
};
