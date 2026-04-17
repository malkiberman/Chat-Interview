require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs/promises");
const path = require("path");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createChatCompletion(prompt, model = "gpt-4o-mini") {
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are an assistant." },
      { role: "user", content: prompt },
    ],
  });
  return response.choices?.[0]?.message?.content ?? "";
}

async function checkOpenAIConnection() {
  try {
    const response = await client.chat.completions.create({ 
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly assistant." },
        { role: "user", content: "Please respond with 'pong' to confirm the connection is working." },
      ],
      max_tokens: 5,
    });
    return {
      ok: response.choices?.[0]?.message?.content?.trim() === "pong",
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || String(error),
    };
  }
}

function resolveEnvFilePath(envKey) {
  const rawPath = process.env[envKey];
  if (!rawPath) {
    throw new Error(`Missing environment variable: ${envKey}`);
  }
  return path.isAbsolute(rawPath) ? rawPath : path.join(__dirname, rawPath);
}

async function readPromptFromEnv() {
  const promptPath = resolveEnvFilePath("PROMPT_FILE_PATH");
  return fs.readFile(promptPath, "utf8");
}

async function readQaJsonFromEnv() {
  const qaPath = resolveEnvFilePath("QA_FILE_PATH");
  const content = await fs.readFile(qaPath, "utf8");
  return JSON.parse(content);
}

async function sendPromptAndQaFromEnv(answers = [], questions = [], model = "gpt-4o-mini") {
  const promptText = await readPromptFromEnv();
  const qaData = Array.isArray(questions) && questions.length > 0 ? questions : await readQaJsonFromEnv();
  const combinedPrompt = `{
  { "technical": { "location": 3, "availability": 1, "hasRelativeInCompany": 0 }, "scores": { "motivation": 85, "verbalAbility": 65, "peopleSkills": 80, "salesOrientation": 30, "targetOrientation": 20 }, "experienceLevel": 2, "recommendedRole": 2, "summary": "מועמדת עם ניסיון רלוונטי משמעותי משירות לקוחות בקופת חולים, המציגה רמת שירותיות גבוהה ורצון אמיתי לסייע.", "insights": [ "ניסיון מוכח בעבודה מול קהל", "יכולת הרגעה במצבי לחץ", "מיקוד גבוה בשביעות רצון", "סבלנות רבה בטיפול בהתנגדויות" ], "recommendedQuestions": [ "איך תתמודדי עם עבודה שדורשת עמידה ביעדים כמותיים?", "תני דוגמה למקרה שבו נאלצת לסרב לבקשת לקוח", "מה יעזור לך לשמור על אנרגיה ביום עם עומס שיחות?" ] }  

}`;
  // if (process.env.OPENAI_API_KEY) {
  //   return createChatCompletion(combinedPrompt, model);
  // }
  return combinedPrompt;
}

module.exports = {
  createChatCompletion,
  checkOpenAIConnection,
  sendPromptAndQaFromEnv,
};
