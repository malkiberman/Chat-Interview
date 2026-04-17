const LOCATION_LABELS = {
  1: 'פתח תקווה',
  2: 'יקנעם',
  3: 'חריש',
  0: 'לא צוין',
};

const ROLE_LABELS = {
  1: 'מכירות',
  2: 'שירות',
  0: 'לא הוגדר',
};

const SCORE_TO_PARAMETER = [
  ['motivation', 'מוטיבציה'],
  ['verbalAbility', 'וורבליות'],
  ['peopleSkills', 'כישורים בין אישיים'],
  ['salesOrientation', 'אוריינטציה מכירתית'],
  ['targetOrientation', 'אוריינטציה ליעדים'],
];

function normalizePriority(score) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

function scoreToBand(score) {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

function normalizeQa(rawAnswers, questions = []) {
  if (!rawAnswers || typeof rawAnswers !== 'object') return [];

  return Object.keys(rawAnswers)
    .sort((a, b) => Number(a.replace('q', '')) - Number(b.replace('q', '')))
    .map((key, idx) => ({
      question: questions[idx] || `שאלה ${idx + 1}`,
      answer: rawAnswers[key] ?? '',
    }));
}

function deriveParameters(scores = {}) {
  return SCORE_TO_PARAMETER.map(([key, label]) => {
    const numericScore = Number(scores[key] ?? 0);
    return { label, value: scoreToBand(numericScore), score: numericScore };
  });
}

function extractAnalysisRecord(source = {}) {
  return source.analysis || source.conversation || source.interview || source;
}

export function normalizeCandidate(record = {}) {
  const analysis = extractAnalysisRecord(record);
  const finalScore = Number(analysis.finalScore ?? record.finalScore ?? record.score ?? 0);
  const recommendedRole = Number(analysis.recommendedRole ?? record.recommendedRole ?? 0);
  const technical = analysis.technical || record.technical || {};
  const scores = analysis.scores || record.scores || {};
  const parameters = Array.isArray(record.parameters) && record.parameters.length
    ? record.parameters
    : deriveParameters(scores);
  const questions = analysis.questions || record.questions || [];
  const rawAnswers = analysis.rawAnswers || record.rawAnswers || {};

  return {
    id: String(record.id ?? analysis.Id ?? analysis.candidateId ?? analysis.id ?? ''),
    candidateId: String(record.candidateId ?? analysis.candidateId ?? ''),
    fullName: record.fullName || record.name || analysis.fullName || 'ללא שם',
    phone: record.phone || analysis.phone || '',
    email: record.email || analysis.email || '',
    score: Number.isFinite(finalScore) ? Math.round(finalScore) : 0,
    priority: record.priority || normalizePriority(finalScore),
    position: record.position || ROLE_LABELS[recommendedRole] || ROLE_LABELS[0],
    recommendedRole,
    recommendedRoleLabel: ROLE_LABELS[recommendedRole] || ROLE_LABELS[0],
    timestamp: analysis.timestamp || record.timestamp || null,
    technical: {
      location: Number(technical.location ?? 0),
      locationLabel: LOCATION_LABELS[Number(technical.location ?? 0)] || LOCATION_LABELS[0],
      availability: Number(technical.availability ?? 0),
      hasRelativeInCompany: Number(technical.hasRelativeInCompany ?? 0),
    },
    scores,
    experienceLevel: Number(analysis.experienceLevel ?? record.experienceLevel ?? 0),
    aiSummary: analysis.summary || record.aiSummary || '',
    strengths: analysis.insights || record.strengths || [],
    weaknesses: record.weaknesses || [],
    recommendedQuestions: analysis.recommendedQuestions || record.recommendedQuestions || [],
    parameters,
    qa: Array.isArray(record.qa) && record.qa.length ? record.qa : normalizeQa(rawAnswers, questions),
    rawAnswers,
  };
}

export function normalizeCandidates(records = []) {
  if (!Array.isArray(records)) return [];
  return records.map(normalizeCandidate);
}
