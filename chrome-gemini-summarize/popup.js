// popup.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("popup.js: DOMContentLoaded - API Key and Prompt Popup script started.");

    const apiKeyInput = document.getElementById('apiKeyInput');
    const promptInput = document.getElementById('promptInput');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const resetPromptButton = document.getElementById('resetPromptButton');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const promptStatus = document.getElementById('promptStatus');

    const DEFAULT_PROMPT = "Summarize this web page as a short paragraph";

    // Function to display status messages
    function setStatus(element, message, isError = false) {
        element.textContent = message;
        element.classList.remove('hidden', 'text-green-500', 'text-red-500', 'text-gray-500');
        if (isError) {
            element.classList.add('text-red-500');
        } else if (message.includes("saved") || message.includes("loaded")) {
            element.classList.add('text-green-500');
        } else {
            element.classList.add('text-gray-500');
        }
        element.classList.remove('hidden');
    }

    // Load saved settings on popup open
    console.log("popup.js: Attempting to load settings from chrome.storage.local...");
    chrome.storage.local.get(['geminiApiKey', 'summarizationPrompt'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("popup.js: Error loading settings:", chrome.runtime.lastError);
            setStatus(apiKeyStatus, "Error loading settings.", true);
            return;
        }

        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
            setStatus(apiKeyStatus, "API Key loaded.");
            console.log("popup.js: API Key successfully loaded.");
        } else {
            setStatus(apiKeyStatus, "No API Key found. Please enter and save.", false);
            console.log("popup.js: No API Key found in storage.");
        }

        if (result.summarizationPrompt) {
            promptInput.value = result.summarizationPrompt;
            setStatus(promptStatus, "Prompt loaded.");
            console.log("popup.js: Prompt successfully loaded.");
        } else {
            promptInput.value = DEFAULT_PROMPT; // Set default if not found
            setStatus(promptStatus, "Default prompt loaded. Save to confirm.", false);
            console.log("popup.js: No custom prompt found, set to default.");
        }
    });

    // Save settings (API Key and Prompt)
    saveSettingsButton.addEventListener('click', () => {
        console.log("popup.js: Save Settings button clicked.");
        const apiKey = apiKeyInput.value.trim();
        const prompt = promptInput.value.trim();

        if (!apiKey) {
            setStatus(apiKeyStatus, "API Key cannot be empty.", true);
            console.warn("popup.js: Attempted to save with empty API key.");
            return;
        }
        if (!prompt) {
            setStatus(promptStatus, "Prompt cannot be empty. Resetting to default.", true);
            promptInput.value = DEFAULT_PROMPT; // Force default if user tries to save empty prompt
            return;
        }

        chrome.storage.local.set({ geminiApiKey: apiKey, summarizationPrompt: prompt }, () => {
            if (chrome.runtime.lastError) {
                console.error("popup.js: Error saving settings:", chrome.runtime.lastError);
                setStatus(apiKeyStatus, "Error saving settings.", true);
                return;
            }
            setStatus(apiKeyStatus, "API Key saved!");
            setStatus(promptStatus, "Prompt saved!");
            console.log("popup.js: API Key and Prompt successfully saved.");
        });
    });

    // Reset Prompt to default
    resetPromptButton.addEventListener('click', () => {
        console.log("popup.js: Reset Prompt button clicked.");
        promptInput.value = DEFAULT_PROMPT;
        chrome.storage.local.set({ summarizationPrompt: DEFAULT_PROMPT }, () => {
            if (chrome.runtime.lastError) {
                console.error("popup.js: Error resetting prompt:", chrome.runtime.lastError);
                setStatus(promptStatus, "Error resetting prompt.", true);
                return;
            }
            setStatus(promptStatus, "Prompt reset to default and saved!");
            console.log("popup.js: Prompt reset to default and saved.");
        });
    });
});
