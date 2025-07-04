// content.js
// Listen for messages from the extension popup
console.log("content.js: Content script loaded.");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("content.js: Message received from background script:", request.action);
    if (request.action === 'summarizePage') {
        const apiKey = request.apiKey; // Get API key from the background script
        if (!apiKey) {
            console.error("content.js: API Key not provided by the background script.");
            displaySummaryOnPage("Error: API Key not available. Please set it via the extension's right-click menu.", true);
            sendResponse({ error: "API Key not provided by the background script." });
            return true;
        }
        console.log("content.js: API Key received.");

        // Find the main content of the page
        console.log("content.js: Attempting to extract main content...");
        const mainContent = extractMainContent();

        if (!mainContent) {
            console.warn("content.js: Could not find enough content to summarize.");
            displaySummaryOnPage("Could not find enough content on this page to summarize.", true);
            sendResponse({ error: "Could not find enough content to summarize." });
            return true; // Indicate that sendResponse will be called asynchronously
        }
        console.log(`content.js: Main content extracted (length: ${mainContent.length}).`);

        // Call the Gemini API to summarize the content
        console.log("content.js: Calling Gemini API for summarization...");
        displaySummaryOnPage("Summarizing page content...", false, true); // Show loading message
        summarizeTextWithGemini(mainContent, apiKey) // Pass API key to the function
            .then(summary => {
                console.log("content.js: Summary received from Gemini API.");
                displaySummaryOnPage(summary); // Display actual summary
                sendResponse({ summary: summary });
            })
            .catch(error => {
                console.error("content.js: Error during summarization process:", error);
                displaySummaryOnPage(`Error summarizing: ${error.message || error}`, true); // Display error on page
                sendResponse({ error: error.message || "An unknown error occurred during summarization." });
            });

        return true; // Indicate that sendResponse will be called asynchronously
    }
});

/**
 * Extracts the main textual content from the current web page.
 * It prioritizes <article>, <main>, or common content divs.
 * As a fallback, it cleans and uses the body's innerText.
 * @returns {string|null} The extracted main content, or null if insufficient.
 */
function extractMainContent() {
    let content = '';

    // Prioritize <article> or <main> tags
    const article = document.querySelector('article');
    const main = document.querySelector('main');

    if (article) {
        content = article.innerText;
        console.log("content.js: Extracted content from <article> tag.");
    } else if (main) {
        content = main.innerText;
        console.log("content.js: Extracted content from <main> tag.");
    } else {
        // Fallback to common content divs or body
        const commonContentSelectors = [
            '.post-content', '.entry-content', '.article-content',
            '#content', '#main-content', '.main-body', '.page-content'
        ];
        let foundSelector = false;
        for (const selector of commonContentSelectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText.length > 200) { // Check for reasonable length
                content = el.innerText;
                console.log(`content.js: Extracted content from common selector: ${selector}`);
                foundSelector = true;
                break;
            }
        }

        if (!foundSelector) {
            // Last resort: clean body text
            content = document.body.innerText;
            console.log("content.js: Extracted content from document.body (fallback).");
            // Remove script and style content
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            // Remove multiple newlines and leading/trailing whitespace
            content = content.replace(/\n\s*\n/g, '\n').trim();
            console.log("content.js: Cleaned body content.");
        }
    }

    // Basic cleaning and length check
    if (content.length < 100) { // Require at least 100 characters to attempt summary
        console.warn("content.js: Insufficient content extracted for summarization (less than 100 chars).");
        return null;
    }

    // Limit content length sent to API to avoid token limits and improve performance
    const maxLength = 8000; // A reasonable limit for text input
    if (content.length > maxLength) {
        content = content.substring(0, maxLength);
        console.warn(`content.js: Content truncated to ${maxLength} characters.`);
    }

    return content;
}

/**
 * Calls the Gemini API to summarize the given text.
 * @param {string} textToSummarize The text content to be summarized.
 * @param {string} apiKey The Gemini API key.
 * @returns {Promise<string>} A promise that resolves with the summary text.
 */
async function summarizeTextWithGemini(textToSummarize, apiKey) {
    // Updated prompt for 5th-grade reading level, short sentences, bullets, and context
    const prompt = `Summarize this page so I can decide if I should read the full article. Use short sentences and be direct and to the point. Ensure main takeaways are included as well as key people/places/tools/media that are mentioned. You do not need to be exhaustive. Do not add detail or references not already on the page.:

    ${textToSummarize}`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    console.log("content.js: Fetching summary from Gemini API...");
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`content.js: API response not OK. Status: ${response.status}, Error:`, errorData);
            throw new Error(`API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log("content.js: Raw API response:", result);

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            console.log("content.js: Successfully extracted summary from API response.");
            return result.candidates[0].content.parts[0].text;
        } else {
            console.warn("content.js: No summary found in API response structure.");
            throw new Error("No summary found in API response.");
        }
    } catch (error) {
        console.error("content.js: Error during Gemini API call:", error);
        throw error; // Re-throw to be caught by the message listener
    }
}

/**
 * Displays the summary at the top of the current web page.
 * @param {string} summary The summary text to display.
 * @param {boolean} isError Whether the summary is an error message.
 * @param {boolean} isLoading Whether the summary is a loading message.
 */
function displaySummaryOnPage(summary, isError = false, isLoading = false) {
    console.log(`content.js: Displaying summary on page. Is error: ${isError}, Is loading: ${isLoading}`);
    // Remove any existing summary box to prevent duplicates
    const existingSummaryBox = document.getElementById('gemini-summary-box');
    if (existingSummaryBox) {
        console.log("content.js: Removing existing summary box.");
        existingSummaryBox.remove();
    }

    const summaryBox = document.createElement('div');
    summaryBox.id = 'gemini-summary-box';
    summaryBox.style.cssText = `
        position: fixed; /* Keep it fixed at the top */
        top: 0;
        left: 0;
        width: 100%;
        background-color: ${isError ? '#fee2e2' : (isLoading ? '#fff3cd' : '#e0e7ff')}; /* Error: red, Loading: yellow, Normal: blue */
        color: ${isError ? '#991b1b' : (isLoading ? '#664d03' : '#2d3748')};
        padding: 1rem 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 2147483647 !important; /* Absolute maximum z-index with !important */
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        border-bottom: 1px solid ${isError ? '#fca5a5' : (isLoading ? '#ffecb5' : '#a7b3ff')};
        box-sizing: border-box; /* Include padding in width */
        cursor: pointer; /* Indicate it's clickable */
    `;

    // Create a container for the summary text to allow for different formatting
    const summaryContentContainer = document.createElement('div');
    summaryContentContainer.style.cssText = `
        flex-grow: 1;
        margin-right: 1rem;
        word-wrap: break-word;
        overflow-wrap: break-word;
    `;

    // Check if the summary looks like a bulleted list
    // This regex looks for lines starting with *, -, or a digit followed by a period and space
    const bulletPointRegex = /^\s*[-*•\d]+\s+/m; // Added '•' and digit support
    const lines = summary.split('\n').filter(line => line.trim() !== ''); // Split by newline and remove empty lines

    if (!isError && !isLoading && lines.length > 1 && lines.some(line => bulletPointRegex.test(line))) {
        console.log("content.js: Formatting summary as a bulleted list.");
        const ul = document.createElement('ul');
        ul.style.cssText = `
            list-style-type: disc; /* Default disc bullets */
            padding-left: 1.5rem; /* Indent for bullets */
            margin: 0; /* Remove default ul margin */
        `;
        lines.forEach(line => {
            const li = document.createElement('li');
            // Remove common bullet prefixes like "* " or "- "
            li.textContent = line.replace(/^\s*[-*•\d]+\s*/, '').trim();
            ul.appendChild(li);
        });
        summaryContentContainer.appendChild(ul);
    } else {
        console.log("content.js: Formatting summary as a paragraph.");
        const p = document.createElement('p');
        p.textContent = summary;
        summaryContentContainer.appendChild(p);
    }


    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;'; // HTML entity for 'x'
    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: ${isError ? '#991b1b' : (isLoading ? '#664d03' : '#4a5568')};
        line-height: 1;
        padding: 0;
        margin-left: 1rem;
    `;
    // Original close button click handler
    closeButton.onclick = (event) => {
        event.stopPropagation(); // Prevent the click from bubbling up to the summaryBox
        console.log("content.js: Close button clicked. Removing summary box.");
        summaryBox.remove();
    };

    // New: Click anywhere on the summary box to close it
    summaryBox.onclick = () => {
        console.log("content.js: Summary box clicked. Removing summary box.");
        summaryBox.remove();
    };

    summaryBox.appendChild(summaryContentContainer); // Append the container, not summaryText directly
    summaryBox.appendChild(closeButton); // Close button is always shown now


    document.body.prepend(summaryBox);
    console.log("content.js: Summary box added to the page.");

    // Removed the automatic auto-hide timeout.
    // The summary box will now only disappear when the close button or the box itself is clicked.
}
