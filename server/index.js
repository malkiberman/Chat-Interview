const express = require("express");
const { createConversationEntity } = require("./conversationService");
const fs = require("fs/promises");
const path = require("path");

const app = express();
app.use(express.json());

const CONVERSATIONS_FILE = path.join(__dirname, "conversations.json");
const CANDIDATES_FILE = path.join(__dirname, "candidates.json");

// הוסף CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// פונקציה לשמירת מועמד לקובץ JSON
async function saveCandidateToFile(candidateData) {
  try {
    let candidates = [];
    
    // קרא את הקובץ הקיים אם קיים
    try {
      const fileContent = await fs.readFile(CANDIDATES_FILE, 'utf8');
      candidates = JSON.parse(fileContent);
    } catch (err) {
      candidates = [];
    }
    
    // בדוק אם המועמד כבר קיים
    const existingIndex = candidates.findIndex(c => c.candidateId === candidateData.candidateId);
    
    if (existingIndex >= 0) {
      // עדכן מועמד קיים
      candidates[existingIndex] = { ...candidates[existingIndex], ...candidateData, updatedAt: new Date().toISOString() };
      console.log('🔄 [שמירה] מועמד עודכן ב-candidates.json');
    } else {
      // הוסף מועמד חדש
      candidates.push(candidateData);
      console.log('✨ [שמירה] מועמד חדש נוסף ל-candidates.json');
    }
    
    // כתוב חזרה לקובץ
    await fs.writeFile(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('❌ [שמירה] שגיאה בשמירת המועמד:', error);
    throw error;
  }
}

// פונקציה לשמירת שיחה לקובץ JSON
async function saveConversationToFile(conversationData) {
  try {
    let conversations = [];
    
    try {
      const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
      conversations = JSON.parse(fileContent);
    } catch (err) {
      conversations = [];
    }
    
    conversations.push(conversationData);
    
    await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2), 'utf8');
    console.log('💾 [שמירה] שיחה נשמרה בהצלחה ל-conversations.json');
    return true;
  } catch (error) {
    console.error('❌ [שמירה] שגיאה בשמירת השיחה:', error);
    throw error;
  }
}

app.get("/", (_req, res) => {
  res.send("השרת עובד!");
});

// קרא את כל השיחות
app.get("/conversations", async (_req, res) => {
  try {
    const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
    const conversations = JSON.parse(fileContent);
    console.log(`📥 [שרת] קריאה של ${conversations.length} שיחות`);
    return res.status(200).json(conversations);
  } catch (error) {
    console.log('💾 [שרת] עדיין אין שיחות שמורות');
    return res.status(200).json([]);
  }
});

// קרא את כל המועמדים
app.get("/candidates", async (_req, res) => {
  try {
    const fileContent = await fs.readFile(CANDIDATES_FILE, 'utf8');
    const candidates = JSON.parse(fileContent);
    console.log(`📥 [שרת] קריאה של ${candidates.length} מועמדים`);
    return res.status(200).json(candidates);
  } catch (error) {
    console.log('💾 [שרת] עדיין אין מועמדים שמורים');
    return res.status(200).json([]);
  }
});

// קרא שיחה ספציפית לפי ID
app.get("/conversations/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`📥 [שרת] חיפוש שיחה ל-ID: ${id}`);
  
  try {
    const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
    const conversations = JSON.parse(fileContent);
    
    let conversation = conversations.find(c => c.candidateId === id || c.Id === id);
    
    if (!conversation) {
      console.log(`❌ [שרת] שיחה לא נמצאה: ${id}`);
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    console.log(`✅ [שרת] שיחה נמצאה: ${id}`);
    return res.status(200).json(conversation);
  } catch (error) {
    console.error('❌ [שרת] שגיאה בקריאת השיחה:', error);
    return res.status(500).json({ error: error.message });
  }
});

// קרא מועמד ספציפי לפי ID
app.get("/candidates/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`📥 [שרת] חיפוש מועמד ל-ID: ${id}`);
  
  try {
    const fileContent = await fs.readFile(CANDIDATES_FILE, 'utf8');
    const candidates = JSON.parse(fileContent);
    
    let candidate = candidates.find(c => c.candidateId === id || c.id === id);
    
    if (!candidate) {
      console.log(`❌ [שרת] מועמד לא נמצא: ${id}`);
      return res.status(404).json({ error: "Candidate not found" });
    }
    
    console.log(`✅ [שרת] מועמד נמצא: ${id}`);
    return res.status(200).json(candidate);
  } catch (error) {
    console.error('❌ [שרת] שגיאה בקריאת המועמד:', error);
    return res.status(500).json({ error: error.message });
  }
});

// פונקציה לשמירת שיחה לקובץ JSON
async function saveConversationToFile(conversationData) {
  try {
    let conversations = [];
    
    // קרא את הקובץ הקיים אם קיים
    try {
      const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
      conversations = JSON.parse(fileContent);
    } catch (err) {
      // הקובץ לא קיים עדיין, נתחילו מערך ריק
      conversations = [];
    }
    
    // הוסף את השיחה החדשה
    conversations.push(conversationData);
    
    // כתוב חזרה לקובץ
    await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2), 'utf8');
    console.log('💾 [שמירה] שיחה נשמרה בהצלחה ל-conversations.json');
    return true;
  } catch (error) {
    console.error('❌ [שמירה] שגיאה בשמירת השיחה:', error);
    throw error;
  }
}

app.post("/conversation", async (req, res) => {
  console.log('📥 [שרת] קיבל בקשה ל-/conversation');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  const { candidateId, candidate, answers } = req.body;

  if (!candidateId || !Array.isArray(answers)) {
    console.log('❌ [שרת] Missing required fields');
    return res.status(400).json({
      error: "Missing required fields: candidateId and answers must be provided.",
    });
  }

  try {
    console.log('⏳ [שרת] מעבד את הנתונים...');
    const conversationEntity = await createConversationEntity(candidateId, answers);
    console.log('✅ [שרת] הצלחה! שומר לקבצים...');
    
    // צור מועמד object מתוך השיחה ופרטי המועמד
    const candidateRecord = {
      id: conversationEntity.Id,
      candidateId: conversationEntity.candidateId,
      fullName: candidate?.fullName || candidateId.split('@')[0] || candidateId,
      email: candidate?.email || candidateId,
      phone: candidate?.phone || '',
      score: conversationEntity.finalScore,
      timestamp: conversationEntity.timestamp,
      experienceLevel: conversationEntity.experienceLevel,
      recommendedRole: conversationEntity.recommendedRole,
      technical: conversationEntity.technical,
      scores: conversationEntity.scores,
      summary: conversationEntity.summary,
    };
    
    console.log('👤 [שרת] שומר מועמד:', candidateRecord.fullName);
    
    // שמור את המועמד
    await saveCandidateToFile(candidateRecord);
    
    // שמור את השיחה
    await saveConversationToFile(conversationEntity);
    
    return res.status(200).json(conversationEntity);
  } catch (error) {
    console.error('❌ [שרת] Error creating conversation entity:', error);
    console.error('📋 [שרת] Error message:', error.message);
    console.error('📋 [שרת] Error stack:', error.stack);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

