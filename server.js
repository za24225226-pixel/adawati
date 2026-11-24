
require("dotenv").config();

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ØªØ±Ø¬Ù…Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©
app.post("/api/translate-cv", async (req, res) => {
  try {
    const { cvData, targetLanguage } = req.body;

    if (!cvData || typeof cvData !== "object" || Array.isArray(cvData)) {
      return res.status(400).json({
        error: "Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ© ØºÙŠØ± ØµØ­ÙŠØ­Ø©."
      });
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      return res.status(400).json({
        error: "Ø§Ø®ØªØ§Ø± Ø§Ù„Ù„ØºØ© Ø§Ù„Ù„ÙŠ Ø¹Ø§ÙŠØ² ØªØªØ±Ø¬Ù… Ù„ÙŠÙ‡Ø§."
      });
    }

    if (targetLanguage.length > 50) {
      return res.status(400).json({
        error: "Ø§Ø³Ù… Ø§Ù„Ù„ØºØ© Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ù‹Ø§."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Ù…ÙØªØ§Ø­ Gemini ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ù…Ù„Ù .env."
      });
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite"
    });

    const prompt = `
Ø£Ù†Øª Ù…ØªØ±Ø¬Ù… Ù…Ø­ØªØ±Ù Ù„Ù„Ø³ÙŠØ± Ø§Ù„Ø°Ø§ØªÙŠØ©.

ØªØ±Ø¬Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ© Ø§Ù„ØªØ§Ù„ÙŠØ© Ø¥Ù„Ù‰ Ø§Ù„Ù„ØºØ©:
${targetLanguage}

Ø§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª:
- Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙƒÙ…Ø§ Ù‡ÙŠ.
- Ù„Ø§ ØªØ®ØªØ±Ø¹ Ø£ÙŠ Ø®Ø¨Ø±Ø§Øª Ø£Ùˆ Ù…Ù‡Ø§Ø±Ø§Øª Ø£Ùˆ Ù…Ø¤Ù‡Ù„Ø§Øª.
- Ù„Ø§ ØªØ­Ø°Ù Ø£ÙŠ Ù…Ø¹Ù„ÙˆÙ…Ø©.
- Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ø£Ø´Ø®Ø§Øµ ÙˆØ§Ù„Ø£Ø±Ù‚Ø§Ù… ÙˆØ§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆØ£Ø±Ù‚Ø§Ù… Ø§Ù„Ù‡Ø§ØªÙ.
- Ø§Ø¬Ø¹Ù„ Ø§Ù„ØµÙŠØ§ØºØ© Ø§Ø­ØªØ±Ø§ÙÙŠØ© ÙˆÙ…Ù†Ø§Ø³Ø¨Ø© Ù„Ø³ÙŠØ±Ø© Ø°Ø§ØªÙŠØ©.
- Ø£Ø¹Ø¯ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø¨ØµÙŠØºØ© JSON ÙÙ‚Ø·.
- Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ù…ÙØ§ØªÙŠØ­ ÙƒÙ…Ø§ Ù‡ÙŠ.

Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©:
${JSON.stringify(cvData)}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({
      success: true,
      translatedCV: response
    });

  } catch (error) {
    console.error("CV Translation Error:", error.message);

    res.status(500).json({
      error: "Ø­ØµÙ„Øª Ù…Ø´ÙƒÙ„Ø© Ø£Ø«Ù†Ø§Ø¡ ØªØ±Ø¬Ù…Ø© Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© ØªØ§Ù†ÙŠØ©."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Adawati is running at http://localhost:${port}`);
});


