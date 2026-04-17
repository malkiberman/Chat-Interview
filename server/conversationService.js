const { sendPromptAndQaFromEnv } = require("./openaiService");
const { calculateFinalScore } = require("./scoreService");
const fs = require("fs/promises");
const path = require("path");

function parseJsonResponse(response) {
  if (typeof response !== "string") {
    return response;
  }

  let trimmed = response.trim();
  // Handle common AI bug: double opening curly braces
  if (trimmed.startsWith('{\n  {')) {
    trimmed = trimmed.replace(/^\{\s*\{/, '{');
  }
  // Remove trailing non-JSON characters after the last closing curly brace
  const lastBrace = trimmed.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace < trimmed.length - 1) {
    trimmed = trimmed.slice(0, lastBrace + 1);
  }
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error('[parseJsonResponse] JSON parse error:', error.message);
    console.error('[parseJsonResponse] Problematic JSON:', trimmed);
    // Try to extract the first valid JSON object
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        console.error('[parseJsonResponse] Inner JSON parse error:', innerError.message);
        console.error('[parseJsonResponse] Inner problematic JSON:', match[0]);
      }
    }
    throw new Error(`Unable to parse AI response as JSON. Error: ${error.message}`);
  }
}

function buildRawAnswersMap(answers) {
  if (!Array.isArray(answers)) {
    return {};
  }
  return answers.reduce((acc, answer, index) => {
    acc[`q${index + 1}`] = answer;
    return acc;
  }, {});
}

function buildScoreArrays(analysis) {
  const scores = analysis.scores || {};

  const scoreValues = [
    scores.motivation ?? 0,
    scores.verbalAbility ?? 0,
    scores.peopleSkills ?? 0,
    scores.salesOrientation ?? 0,
    scores.targetOrientation ?? 0
  ];

  const weightValues = [30, 20, 20, 15, 15]
  return { scoreValues, weightValues };
}

async function createConversationEntity(candidateId, answers, providedQuestions = null) {
  if (!candidateId) {
    throw new Error("candidateId is required.");
  }

  let questions = Array.isArray(providedQuestions) ? providedQuestions : [];
  if (questions.length === 0) {
    const qaFilePath = process.env.QA_FILE_PATH || "./questions.json";
    const resolvedPath = path.isAbsolute(qaFilePath)
      ? qaFilePath
      : path.join(__dirname, qaFilePath);
    const qaContent = await fs.readFile(resolvedPath, "utf8");
    const qaData = JSON.parse(qaContent);

    if (Array.isArray(qaData)) {
      questions = qaData.map((item) => item.question || item);
    } else if (qaData.questions) {
      questions = qaData.questions;
    }
  }

  const aiResult = await sendPromptAndQaFromEnv(answers, questions);
  const analysis = parseJsonResponse(aiResult);

  // Check if location or availability is 0 - if so, finalScore is 0
  const technical = analysis.technical || {};
  let finalScore = 0;

  if (technical.location === 0 || technical.availability === 0) {
    finalScore = 0;
  } else {
    const { scoreValues, weightValues } = buildScoreArrays(analysis);
    finalScore = calculateFinalScore(scoreValues, weightValues);
  }

  return {
    candidateId,
    Id: `${candidateId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    questions,
    answers: answers.map((answer, idx) => ({
      question: questions[idx] || `שאלה ${idx + 1}`,
      answer: answer
    })),
    technical: analysis.technical || {},
    scores: analysis.scores || {},
    experienceLevel: Number(analysis.experienceLevel ?? 0),
    finalScore,
    recommendedRole: analysis.recommendedRole ?? 0,
    summary: analysis.summary ?? "",
    insights: Array.isArray(analysis.insights) ? analysis.insights : [],
    recommendedQuestions: Array.isArray(analysis.recommendedQuestions) ? analysis.recommendedQuestions : [],
    rawAnswers: buildRawAnswersMap(answers),
  };
}

module.exports = {
  createConversationEntity,
};
