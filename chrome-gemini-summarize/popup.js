// popup.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("popup.js: DOMContentLoaded - API Key Popup script started.");

    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyButton = document.getElementById('saveApiKeyButton');
    const apiKeyStatus = document.getElementById('apiKeyStatus');

    // Load saved API key on popup open
    console.log("popup.js: Attempting to load API key from chrome.storage.local...");
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("popup.js: Error loading API key:", chrome.runtime.lastError);
            apiKeyStatus.textContent = "Error loading API Key.";
            apiKeyStatus.classList.remove('hidden');
            apiKeyStatus.classList.remove('text-green-500');
            apiKeyStatus.classList.add('text-red-500');
            return;
        }

        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
            apiKeyStatus.textContent = "API Key loaded.";
            apiKeyStatus.classList.remove('hidden');
            apiKeyStatus.classList.remove('text-red-500');
            apiKeyStatus.classList.add('text-green-500');
            console.log("popup.js: API Key successfully loaded.");
        } else {
            apiKeyStatus.textContent = "No API Key found. Please enter and save.";
            apiKeyStatus.classList.remove('hidden');
            apiKeyStatus.classList.remove('text-green-500');
            apiKeyStatus.classList.add('text-gray-500'); // Neutral color for "not found"
            console.log("popup.js: No API Key found in storage.");
        }
    });

    // Save API key
    saveApiKeyButton.addEventListener('click', () => {
        console.log("popup.js: Save API Key button clicked.");
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            console.log("popup.js: Attempting to save API key to chrome.storage.local...");
            chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
                if (chrome.runtime.lastError) {
                    console.error("popup.js: Error saving API key:", chrome.runtime.lastError);
                    apiKeyStatus.textContent = "Error saving API Key.";
                    apiKeyStatus.classList.remove('hidden');
                    apiKeyStatus.classList.remove('text-green-500');
                    apiKeyStatus.classList.add('text-red-500');
                    return;
                }
                apiKeyStatus.textContent = "API Key saved!";
                apiKeyStatus.classList.remove('hidden');
                apiKeyStatus.classList.remove('text-red-500');
                apiKeyStatus.classList.add('text-green-500');
                console.log("popup.js: API Key successfully saved.");

                // Optionally, close the popup after successful save
                // window.close(); // This might be too aggressive for UX.
                                // Let's leave it open for now, user can close manually.
            });
        } else {
            apiKeyStatus.textContent = "API Key cannot be empty.";
            apiKeyStatus.classList.remove('hidden');
            apiKeyStatus.classList.remove('text-green-500');
            apiKeyStatus.classList.add('text-red-500');
            console.warn("popup.js: Attempted to save empty API key.");
        }
    });
});
