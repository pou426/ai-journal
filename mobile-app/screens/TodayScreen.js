const addSnippet = async () => {
  if (!snippetInput.trim() || !userId) return;

  setIsGenerating(true);
  try {
    // Use the new endpoint that handles both snippet creation and AI summary
    const response = await axios.post(`${API_URL}/snippets/with-summary`, {
      entry: snippetInput.trim(),
      user_id: userId
    });
    
    // Update UI with the new journal entry
    setAiSummary(response.data.entry);
    setSnippetInput('');
    
    // Refresh snippets
    const snippetsResponse = await axios.get(`${API_URL}/snippets/${userId}`);
    const daySnippets = snippetsResponse.data.filter(s => 
      new Date(s.created_at).toISOString().split('T')[0] === date
    );
    setSnippets(daySnippets);
  } catch (error) {
    console.error('Error saving snippet:', error);
  } finally {
    setIsGenerating(false);
  }
}; 