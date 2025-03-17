import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAW96jT1khg7nBDlInnU1Rxp_UFpYF5zLA';
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateJournalSummary = async (snippets) => {
  try {
    // Sort snippets by timestamp
    const sortedSnippets = snippets.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Create the prompt with all snippets
    const snippetsText = sortedSnippets.map(s => s.text).join('\n\n');
    const prompt = `Summarise these daily snippets into a concise and coherent journal entry in a reflective and personal tone. Write in first person and start directly with the content. Do not include any introductory text, meta-commentary, or explanations:\n\n${snippetsText}`;

    // Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw error;
  }
}; 