// Declare summarizeText as async
async function chromeAISummarizeText(textToSummarize) {
    // ... (rest of the function remains the same)
    if (!textToSummarize) return;
  
    document.body.querySelector('#summarization-text').innerText = "Summarizing...";
  
    // Use await to wait for the fetch request to complete
    try {
        // Check for browser AI support
        const summarizerCapabilities = await ai.summarizer.capabilities();
        if (summarizerCapabilities.available === 'no') {
            console.log('Text Summarizer API not available in this browser.');
            return;
        }

        const keyPointsSummarizer = await ai.summarizer.create({ type: 'key-points', format: 'plain-text' });
        const tlDrSummaryText = await keyPointsSummarizer.summarize(textToSummarize);
        document.body.querySelector('#summarization-text').innerText = tlDrSummaryText;
    } catch (error) {
        console.error('Summarization error:', error);
        document.body.querySelector('#summarization-text').innerText = 'Error summarizing text.';
    }
  }

chrome.storage.session.get('lastTextToSummarize', ({ lastTextToSummarize }) => {
    chromeAISummarizeText(lastTextToSummarize);
  });
  
chrome.storage.session.onChanged.addListener(async (changes) => {
    const lastTextToSummarizeChange = changes['lastTextToSummarize'];
  
    if (!lastTextToSummarizeChange) {
      return;
    }
  
    await chromeAISummarizeText(lastTextToSummarizeChange.newValue);

});
