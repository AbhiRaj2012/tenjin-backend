const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. SERVER INITIALIZATION & CONFIGURATION
// ==========================================
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


require('dotenv').config(); // Load environment variables from a .env file

const DEFAULT_DEMO_KEY = process.env.GEMMA_API_KEY || '';
const DEMO_CALL_LIMIT = 30;

app.use(express.json());
// --- NEW: Global CORS Middleware to allow POST requests ---
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Automatically approve preflight requests from the browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});


// Persistent JSON memory acting as our multi-user NoSQL database
const MEMORY_FILE = path.join(__dirname, 'ai_memory.json');
let userDatabase = {};

// Load existing data if the server restarts
if (fs.existsSync(MEMORY_FILE)) {
    userDatabase = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    console.log("🧠 Loaded persistent multi-user database from disk.");
}

// ==========================================
// 2. HELPER FUNCTIONS & PROMPTS
// ==========================================

// Helper: Generate TTS audio with a 5-second timeout safeguard
async function generateAudioWithTimeout(ttsInstance, text, filePath) {
    const ttsPromise = ttsInstance.ttsPromise(text, filePath);
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TTS Timeout')), 5000)
    );
    return Promise.race([ttsPromise, timeoutPromise]);
}

// Extracts valid JSON from Gemini's response, ignoring markdown or conversational filler
function extractValidJSON(rawText) {
    let startIndex = 0;
    while (startIndex < rawText.length) {
        const start = rawText.indexOf('{', startIndex);
        if (start === -1) throw new Error("No JSON object found in response.");
        
        let depth = 0;
        let foundEnd = -1;
        
        for (let i = start; i < rawText.length; i++) {
            if (rawText[i] === '{') depth++;
            else if (rawText[i] === '}') depth--;
            
            if (depth === 0) {
                foundEnd = i;
                break;
            }
        }
        
        if (foundEnd !== -1) {
            const jsonStr = rawText.substring(start, foundEnd + 1);
            try {
                const parsed = JSON.parse(jsonStr);
                // 🛡️ THE SHIELD: Only accept it if it contains our required keys
                if (parsed.ui_japanese && parsed.ui_english) return jsonStr; 
            } catch (e) { /* Ignore parse errors on decoy objects */ }
        }
        startIndex = start + 1; 
    }
    throw new Error("Could not find a valid Tenjin JSON payload in the AI response.");
}

// Scenarios defining Nanami's personality and context
const SCENARIO_PROMPTS = {
  free: "You are Nanami, a friendly Japanese tutor conducting general conversation practice.",
  restaurant: "ROLEPLAY SCENARIO: You are a polite server at a traditional ramen shop in Tokyo. Greet the customer, take their order, and respond in character as a waiter. Keep sentences accessible for a student.",
  directions: "ROLEPLAY SCENARIO: You are a helpful local at Shibuya Station. The student is lost and asking you for directions. Guide them politely in simple Japanese.",
  konbini: "ROLEPLAY SCENARIO: You are a friendly convenience store clerk (Konbini staff). Ask if they need a plastic bag, if they want their bento warmed up, and tell them the total cost."
};


// ==========================================
// 3. CORE WEBSOCKET PIPELINE (CHAT & AI)
// ==========================================
wss.on('connection', (ws, req) => {
    // Uses the actual host header or falls back safely
    const host = req.headers.host || 'localhost';
    const userId = new URL(req.url, `http://${host}`).searchParams.get('userId') || 'guest';
    
    console.log(`🟢 Live session active for user: ${userId}`);
    
    // Auto-initialize the user profile if they are brand new
    if (!userDatabase[userId] || Array.isArray(userDatabase[userId])) {
        userDatabase[userId] = { chatHistory: [], studentProfile: { level: 1, xp: 0, mastered_vocabulary: [] } };
    }
    
    // Ensure all sub-properties exist to prevent crashes on older profiles
    if (!userDatabase[userId].studentProfile) userDatabase[userId].studentProfile = { level: 1, xp: 0, mastered_vocabulary: [] };
    if (!userDatabase[userId].studentProfile.mastered_vocabulary) userDatabase[userId].studentProfile.mastered_vocabulary = [];
    if (!userDatabase[userId].chatHistory) userDatabase[userId].chatHistory = [];

    ws.on('message', async (data) => {
        try {
            const payload = JSON.parse(data);

            // --- 1. DEMO KEY & RATE LIMITING LOGIC ---
            const userHasCustomKey = Boolean(payload.api_key && payload.api_key.trim() !== '');
            const studentProfile = userDatabase[userId].studentProfile;

            // Ensure call counter exists
            if (studentProfile.demo_calls_used === undefined) {
                studentProfile.demo_calls_used = 0;
            }

            let apiKeyToUse;
            let modelToUse;

            if (userHasCustomKey) {
                // USER'S OWN KEY: Unlimited calls & custom model allowed
                apiKeyToUse = payload.api_key;
                modelToUse = payload.cloud_model || 'gemma-4-31b-it';
            } else {
                // SYSTEM DEMO KEY: Enforce limits
                if (!DEFAULT_DEMO_KEY) {
                    return ws.send(JSON.stringify({ 
                        status: 'error', 
                        message: 'No API key provided and server demo key is unconfigured.' 
                    }));
                }

                if (studentProfile.demo_calls_used >= DEMO_CALL_LIMIT) {
                    return ws.send(JSON.stringify({ 
                        status: 'error', 
                        message: `🔒 Demo limit reached (${DEMO_CALL_LIMIT}/${DEMO_CALL_LIMIT} messages). Please add your Gemini API Key in Settings to keep chatting!` 
                    }));
                }

                apiKeyToUse = DEFAULT_DEMO_KEY;
                modelToUse = 'gemma-4-31b-it'; // Locked to Gemma 4 for demo tier
            }

            // --- 2. INITIALIZE MODEL WITH RESOLVED KEY ---
            const selectedScenario = payload.scenario || 'free';
            const scenarioInstruction = SCENARIO_PROMPTS[selectedScenario] || SCENARIO_PROMPTS.free;
            const genAI = new GoogleGenerativeAI(apiKeyToUse);
            const model = genAI.getGenerativeModel({ 
                model: modelToUse,
                generationConfig: { responseMimeType: "application/json" } 
            });

            // Using this const to pass level to the AI, and later update XP
            const studentData = userDatabase[userId].studentProfile;

            const systemInstruction = `
                ${scenarioInstruction}
                
                STUDENT CONTEXT:
                - Student Level: ${studentData.level}
                
                CRITICAL CONSTRAINTS:
                1. Stay strictly in character for the selected roleplay scenario.
                2. Do NOT answer programming, math, or non-Japanese topics.
                3. Keep responses brief (Max 2 sentences) to encourage active back-and-forth dialogue.
                4. If you introduce a new, useful vocabulary word in your response, extract it.
                5. DO NOT output any markdown bullet points, commentary, or reasoning. Output ONLY the raw JSON object starting with {.
                
                FORMATTING RULES:
                You MUST return ONLY a raw JSON object containing exactly these 5 keys:
                "ui_japanese" (string),
                "ui_romaji" (string),
                "ui_english" (string),
                "spoken_payload" (string),
                "new_vocabulary" (an array of objects, e.g., [{"japanese": "鞄", "romaji": "kaban", "english": "bag"}]. Leave as empty [] if no new words are introduced.)
            `;

            // Append image data if the user uploaded an image context
            const userParts = [{ text: `User input: "${payload.message}". Reply in Max 2 sentences. ONLY RETURN JSON.` }];
            if (payload.image_data) {
                const mimeType = payload.image_data.split(';')[0].split(':')[1];
                const base64String = payload.image_data.split(',')[1];
                userParts.push({ inlineData: { data: base64String, mimeType: mimeType } });
            }
            
            // Build the conversational payload 
            const contents = [
                { role: "user", parts: [{ text: systemInstruction }] },
                // Dummy response so the AI understands the exact output shape needed
                { role: "model", parts: [{ text: `{"ui_japanese": "いらっしゃいませ！", "ui_romaji": "Irasshaimase!", "ui_english": "Welcome!", "spoken_payload": "いらっしゃいませ！ Welcome!", "new_vocabulary": []}` }] },
                ...userDatabase[userId].chatHistory,
                { role: "user", parts: userParts }
            ];

            // Step B: Call AI & Parse Result
            const result = await model.generateContent({ contents });
            const rawResponseText = result.response.text();
            console.log("\n--- RAW AI OUTPUT --- \n", rawResponseText, "\n---------------------\n");

            let aiData;
            let cleanResponseText;
            try {
                cleanResponseText = extractValidJSON(rawResponseText);
                aiData = JSON.parse(cleanResponseText);
            } catch (parseError) {
                console.error("Failed to parse JSON. Raw text was:", rawResponseText);
                throw parseError; 
            }

            // Step C: Auto-Flashcard Extraction
            let newlyLearnedWords = [];
            if (aiData.new_vocabulary && Array.isArray(aiData.new_vocabulary)) {
                aiData.new_vocabulary.forEach(word => {
                    const exists = studentData.mastered_vocabulary.some(v => v.japanese === word.japanese);
                    if (!exists && word.japanese) {
                        studentData.mastered_vocabulary.push(word);
                        newlyLearnedWords.push(word);
                    }
                });
            }


            // Increment demo calls counter ONLY if using the system key
            if (!userHasCustomKey) {
                studentProfile.demo_calls_used += 1;
                console.log(`📊 Demo usage for ${userId}: ${studentProfile.demo_calls_used}/${DEMO_CALL_LIMIT}`);
            }

            // Step D: Gamification Tracker (+5 XP per successful message)
            // Note: We reuse 'studentData' here instead of re-declaring it.
            studentData.xp += 5; 
            let xpNeeded = studentData.level * 100;
            
            if (studentData.xp >= xpNeeded) {
                studentData.level += 1;
                studentData.xp -= xpNeeded; // Roll over leftover XP
                console.log(`🎉 User ${userId} leveled up to Level ${studentData.level}!`);
            }

       
           // Step E: Audio Generation (with Safety Fallback)
            let audioBase64 = null;
            try {
                const ttsJP = new EdgeTTS({ voice: 'ja-JP-NanamiNeural', lang: 'ja-JP', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });
                const ttsEN = new EdgeTTS({ voice: 'en-US-AriaNeural', lang: 'en-US', outputFormat: 'audio-24khz-48kbitrate-mono-mp3' });
                
                const tempPathJP = path.join(__dirname, `jp_${Date.now()}.mp3`);
                const tempPathEN = path.join(__dirname, `en_${Date.now()}.mp3`);

                await Promise.all([
                    generateAudioWithTimeout(ttsJP, aiData.ui_japanese, tempPathJP),
                    generateAudioWithTimeout(ttsEN, aiData.ui_english, tempPathEN)
                ]);

                const bufferJP = fs.readFileSync(tempPathJP);
                const bufferEN = fs.readFileSync(tempPathEN);
                fs.unlinkSync(tempPathJP);
                fs.unlinkSync(tempPathEN);

                audioBase64 = Buffer.concat([bufferJP, bufferEN]).toString('base64');
            } catch (ttsErr) {
                console.warn("⚠️ TTS audio generation timed out or failed. Replying in text-only mode:", ttsErr.message);
            }

            // Always send response back to React even if TTS audio failed!
            ws.send(JSON.stringify({
                status: 'speaking',
                text: `${aiData.ui_japanese}\n(${aiData.ui_romaji})\n\n${aiData.ui_english}`,
                audio_base64: audioBase64,
                flashcards_added: newlyLearnedWords
            }));

            // Step F: Save Memory State
            userDatabase[userId].chatHistory.push({ role: "user", parts: [{ text: payload.message }] });
            userDatabase[userId].chatHistory.push({ role: "model", parts: [{ text: cleanResponseText }] }); 

            // Prevent memory bloat (Sliding window of last 10 messages)
            if (userDatabase[userId].chatHistory.length > 10) {
                userDatabase[userId].chatHistory = userDatabase[userId].chatHistory.slice(-10);
            }

            fs.writeFileSync(MEMORY_FILE, JSON.stringify(userDatabase, null, 2));

        } catch (error) {
            console.error(error);
            ws.send(JSON.stringify({ status: 'error', message: 'Processing failed.' }));
        }
    });
});


// ==========================================
// 4. REST API ENDPOINTS
// ==========================================

// Endpoint: Fetch User's Saved Vocabulary
app.get('/api/vocabulary', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    const userId = req.query.userId;
    
    if (!userId || !userDatabase[userId] || !userDatabase[userId].studentProfile) {
        return res.json({ vocabulary: [] });
    }
    res.json({ vocabulary: userDatabase[userId].studentProfile.mastered_vocabulary || [] });
});



// Endpoint: Trigger XP Rewards (Used by Flashcard Quizzes & Assessments)
app.post('/api/add-xp', (req, res) => {
    const { userId, amount } = req.body;
    
    // 1. Auto-initialize if the user took a test before ever opening the chat
    if (!userDatabase[userId]) {
        userDatabase[userId] = { chatHistory: [], studentProfile: { level: 1, xp: 0, mastered_vocabulary: [] } };
    }
    if (!userDatabase[userId].studentProfile) {
        userDatabase[userId].studentProfile = { level: 1, xp: 0, mastered_vocabulary: [] };
    }
    
    // 2. Add the earned XP
    userDatabase[userId].studentProfile.xp += amount;
    
    // 3. Level Scaling with Proper Rollover 
    let xpNeeded = userDatabase[userId].studentProfile.level * 100;
    
    // Use a while loop in case they earned a massive amount of XP that jumps multiple levels
    while (userDatabase[userId].studentProfile.xp >= xpNeeded) {
        userDatabase[userId].studentProfile.level += 1;
        userDatabase[userId].studentProfile.xp -= xpNeeded; 
        xpNeeded = userDatabase[userId].studentProfile.level * 100; // Recalculate for the next level
    }
    
    // 4. Save to database
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(userDatabase, null, 2));
    
    return res.json({ 
        success: true, 
        xp: userDatabase[userId].studentProfile.xp, 
        level: userDatabase[userId].studentProfile.level 
    });
});

// Endpoint: Fetch General Stats (Used by Dashboard)
app.get('/api/profile', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    const userId = req.query.userId;
    
    if (userDatabase[userId] && userDatabase[userId].studentProfile) {
        const profile = userDatabase[userId].studentProfile;
        return res.json({
            ...profile,
            demo_calls_used: profile.demo_calls_used || 0,
            demo_call_limit: DEMO_CALL_LIMIT
        });
    }
    res.json({ level: 1, xp: 0, demo_calls_used: 0, demo_call_limit: DEMO_CALL_LIMIT, mastered_vocabulary: [] });
});

// ==========================================
// 5. SERVER START
// ==========================================
server.listen(8000, () => console.log(`🚀 Unified API Online: ws://localhost:8000`));