async function chromeAIExplainCode(txtCodeToExplain) {
    if (!txtCodeToExplain) return;
  
    document.body.querySelector('#code-explanation-text').innerText = "Analyzing code...";
  
    // Use await to wait for the fetch request to complete
    try {
        // Check for browser AI support

        const codeExplanationModel = await ai.languageModel.create({
          systemPrompt : "You are an expert at understanding and explaining in multiple programming languages.",
        });
        const response = await codeExplanationModel.prompt("Explain the following code in a few bullet points:\n " + txtCodeToExplain);
        document.body.querySelector('#code-explanation-text').innerText = response.trim();
    } catch (error) {
        console.error('Code Explanation error:', error);
        document.body.querySelector('#code-explanation-text').innerText = 'Error analyzing code.';
    }
  }

chrome.storage.session.get('lastCodeToExplain', ({ lastCodeToExplain }) => {
    chromeAIExplainCode(lastCodeToExplain);
  });
  
chrome.storage.session.onChanged.addListener(async (changes) => {
    const lastCodeToExplainChange = changes['lastCodeToExplain'];
  
    if (!lastCodeToExplainChange) {
      return;
    }
  
    await chromeAIExplainCode(lastCodeToExplainChange.newValue);

});
