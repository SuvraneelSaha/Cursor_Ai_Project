const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

const upload = multer();

const SYSTEM_PROMPT = `You are helping tailor a resume for a specific Job Description (JD).
You will receive two inputs:
The original resume (plain text, with sections like Work Experience, Projects, Education, Skills)
The JD (plain text)
Your task is to reorder, highlight, and adjust the resume content so it better fits the JD.
IMPORTANT RULES:
ONLY use information present in the original resume.
DO NOT invent new skills, experience, or certifications.
DO NOT change dates, company names, or job titles.
Maintain tone and style of original resume.
Emphasize relevant experience and de-emphasize unrelated content.
Maintain section headings and logical structure.`;

const openai = new OpenAI({
  apiKey: process.env.GOOSEAI_API_KEY,
  baseURL: 'https://api.goose.ai/v1',
});

app.post('/api/tailor-resume', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jd', maxCount: 1 }
]), async (req, res) => {
  try {
    const resumeFile = req.files['resume']?.[0];
    const jdFile = req.files['jd']?.[0];
    const jdText = req.body.jdText;
    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume PDF is required.' });
    }
    if (!jdFile && !jdText) {
      return res.status(400).json({ error: 'Job Description (JD) is required.' });
    }
    if (resumeFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Uploaded resume must be a PDF file.' });
    }
    // Parse resume PDF
    let resumeText = '';
    try {
      const resumeBuffer = resumeFile.buffer;
      const parsedResume = await pdfParse(resumeBuffer);
      resumeText = parsedResume.text;
      if (!resumeText.trim()) {
        return res.status(400).json({ error: 'Could not extract text from the uploaded PDF. Please try another file.' });
      }
    } catch (pdfErr) {
      return res.status(500).json({ error: 'Failed to parse the resume PDF. Please upload a valid PDF.' });
    }
    // Get JD text
    let jdContent = jdText;
    if (jdFile) {
      try {
        jdContent = jdFile.buffer.toString('utf-8');
      } catch (jdErr) {
        return res.status(400).json({ error: 'Failed to read the uploaded JD file.' });
      }
    }
    if (!jdContent || !jdContent.trim()) {
      return res.status(400).json({ error: 'Job Description (JD) cannot be empty.' });
    }
    // Call GooseAI (OpenAI-compatible)
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Resume:\n${resumeText}\n\nJD:\n${jdContent}` },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });
      const tailoredResume = completion.choices[0].message.content;
      res.json({ tailoredResume });
    } catch (aiErr) {
      console.error('GooseAI API error:', aiErr);
      return res.status(502).json({ error: 'AI service (GooseAI) is currently unavailable. Please try again later.' });
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});