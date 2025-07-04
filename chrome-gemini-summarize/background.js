// background.js
console.log("background.js: Service worker started.");

// Create a context menu item for API key management
chrome.runtime.onInstalled.addListener(() => {
    console.log("background.js: Extension installed or updated. Creating context menu.");
    chrome.contextMenus.create({
        id: "addApiKey",
        title: "Add/Update Gemini API Key",
        contexts: ["action"] // Show when right-clicking the extension icon
    });
});

// Listen for clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addApiKey") {
        console.log("background.js: 'Add/Update API Key' context menu item clicked.");
        // Set the popup to popup.html and open it
        chrome.action.setPopup({ popup: "popup.html" }, () => {
            // No direct way to "open" popup from background script,
            // but setting it will make it appear on the next action click.
            // For context menu, it just sets it for future action clicks.
            // User will need to click the icon again if they want to see the popup immediately.
            // Or, for a more direct approach, we could open a new tab with the popup HTML,
            // but that's generally not the desired UX for an extension popup.
            console.log("background.js: Popup set to popup.html for API key entry.");
        });
    }
});

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(async (tab) => {
    console.log("background.js: Extension icon clicked.");

    try {
        // Check if an API key is stored
        const result = await chrome.storage.local.get(['geminiApiKey']);
        const apiKey = result.geminiApiKey;
        console.log(`background.js: API Key check - found: ${!!apiKey}`);

        if (apiKey) {
            // API key exists, proceed to summarize
            console.log("background.js: API Key found. Sending summarize message to content script.");
            // Reset popup to null so it doesn't show up on subsequent clicks unless needed
            chrome.action.setPopup({ popup: "" });

            // Execute content script if not already injected (for pages loaded before extension)
            // Or if the content script somehow failed to inject.
            // This ensures content.js is ready to receive messages.
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            console.log("background.js: content.js script ensured to be injected.");

            // Send message to content script to summarize
            chrome.tabs.sendMessage(tab.id, { action: 'summarizePage', apiKey: apiKey }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("background.js: Error sending message or receiving response from content script:", chrome.runtime.lastError);
                    // Optionally, display an error to the user via a temporary content script injection
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: (msg) => {
                            // This function runs in the context of the content script
                            const existingError = document.getElementById('gemini-summary-box');
                            if (existingError) existingError.remove();
                            const errorBox = document.createElement('div');
                            errorBox.id = 'gemini-summary-box';
                            errorBox.style.cssText = `
                                position: fixed; top: 0; left: 0; width: 100%; background-color: #fee2e2;
                                color: #991b1b; padding: 1rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                z-index: 9999999; font-family: 'Inter', sans-serif; font-size: 1rem;
                                line-height: 1.5; display: flex; align-items: flex-start; justify-content: space-between;
                                border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem;
                                border-bottom: 1px solid #fca5a5; box-sizing: border-box;
                            `;
                            errorBox.innerHTML = `<p style="flex-grow: 1; margin-right: 1rem; word-wrap: break-word; overflow-wrap: break-word;">${msg}</p>
                                <button style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #991b1b; line-height: 1; padding: 0; margin-left: 1rem;" onclick="this.parentNode.remove()">&times;</button>`;
                            document.body.prepend(errorBox);
                            setTimeout(() => { if (errorBox && errorBox.parentNode) errorBox.remove(); }, 10000);
                        },
                        args: ["Error: Could not communicate with the summarizer script on this page. Try refreshing the page."]
                    });
                } else if (response && response.error) {
                    console.error("background.js: Content script reported an error:", response.error);
                    // The content script itself will display the error on the page
                } else if (response && response.summary) {
                    console.log("background.js: Summary process initiated by content script.");
                } else {
                    console.warn("background.js: Unexpected response from content script.");
                }
            });

        } else {
            // No API key, open the popup for API key entry
            console.log("background.js: No API Key found. Setting popup to popup.html.");
            chrome.action.setPopup({ popup: "popup.html" }, () => {
                // This callback runs after the popup is set.
                // The user still needs to click the icon again to open the popup.
                // A common pattern is to open it programmatically if it's critical.
                // However, direct programmatic opening of the popup from background
                // is not straightforward and often involves creating a new window,
                // which is not ideal for a simple popup.
                // The user will see the popup on the *next* click, or can right-click.
                console.log("background.js: Popup path set. User needs to click again to open.");
            });
            // Inform the user that they need to click again to open the popup
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    const existingMsg = document.getElementById('gemini-summary-box');
                    if (existingMsg) existingMsg.remove();
                    const msgBox = document.createElement('div');
                    msgBox.id = 'gemini-summary-box';
                    msgBox.style.cssText = `
                        position: fixed; top: 0; left: 0; width: 100%; background-color: #fff3cd;
                        color: #664d03; padding: 1rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        z-index: 9999999; font-family: 'Inter', sans-serif; font-size: 1rem;
                        line-height: 1.5; display: flex; align-items: flex-start; justify-content: space-between;
                        border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem;
                        border-bottom: 1px solid #ffecb5; box-sizing: border-box;
                    `;
                    msgBox.innerHTML = `<p style="flex-grow: 1; margin-right: 1rem; word-wrap: break-word; overflow-wrap: break-word;">Please enter your Gemini API Key. Click the extension icon again, or right-click it and select "Add/Update Gemini API Key".</p>
                        <button style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #664d03; line-height: 1; padding: 0; margin-left: 1rem;" onclick="this.parentNode.remove()">&times;</button>`;
                    document.body.prepend(msgBox);
                    setTimeout(() => { if (msgBox && msgBox.parentNode) msgBox.remove(); }, 15000);
                }
            });
        }
    } catch (error) {
        console.error("background.js: Error during action click handler:", error);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: (msg) => {
                const existingError = document.getElementById('gemini-summary-box');
                if (existingError) existingError.remove();
                const errorBox = document.createElement('div');
                errorBox.id = 'gemini-summary-box';
                errorBox.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; background-color: #fee2e2;
                    color: #991b1b; padding: 1rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    z-index: 9999999; font-family: 'Inter', sans-serif; font-size: 1rem;
                    line-height: 1.5; display: flex; align-items: flex-start; justify-content: space-between;
                    border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem;
                    border-bottom: 1px solid #fca5a5; box-sizing: border-box;
                `;
                errorBox.innerHTML = `<p style="flex-grow: 1; margin-right: 1rem; word-wrap: break-word; overflow-wrap: break-word;">${msg}</p>
                    <button style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #991b1b; line-height: 1; padding: 0; margin-left: 1rem;" onclick="this.parentNode.remove()">&times;</button>`;
                document.body.prepend(errorBox);
                setTimeout(() => { if (errorBox && errorBox.parentNode) errorBox.remove(); }, 10000);
            },
            args: [`An unexpected error occurred: ${error.message || 'Unknown error'}`]
        });
    }
});
