const addSnippet = async () => {
  if (!snippetInput.trim()) return;

  const newSnippet = {
    id: Date.now().toString(),
    text: snippetInput.trim(),
    timestamp: new Date().toISOString(),
  };

  const newSnippets = [...snippets, newSnippet];
  
  // First update UI with the new snippet
  setSnippets(newSnippets);
  setSnippetInput('');
  setIsGenerating(true);
  
  try {
    // Send to backend which will handle AI summary generation
    const response = await axios.put(`${API_URL}/entries/${date}`, {
      content: JSON.stringify({
        snippets: newSnippets,
      }),
      date: `${date}T00:00:00.000Z`,
    });
    
    // Get the updated entry with AI summary
    const updatedEntry = await axios.get(`${API_URL}/entries/${date}`);
    const data = JSON.parse(updatedEntry.data.content);
    setAiSummary(data.aiSummary || '');
  } catch (error) {
    console.error('Error saving snippet:', error);
  } finally {
    setIsGenerating(false);
  }
}; 