# Chrome Built-in AI Experiments
This repository captures some examples of using Built-in AI Experiments in Chrome Browser. The premise of of Chrome Built-in AI is to have access to AI models, including large language models (LLMs), directly into the browser. This keeps the processing local to the browser. Read about it over [here](https://developer.chrome.com/docs/ai/built-in).

# Join the Early Access Preview Program
Sign up [here](https://goo.gle/chrome-ai-dev-preview-join) for updates.

# Install Chrome Canary first
The feature is currently available in Chrome Canary or Chrome Developer. I have been testing it out in the Chrome Canary version. Download it [here](https://www.google.com/intl/en_in/chrome/canary/)

# Installation Steps
Check out the following [document](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0) that provides steps on activating the Built-in AI features inside the Chrome browser. Follow these steps carefully. This document highlights how to get the *Prompt API* enabled in the browser, that allows you to send Natural Language instructions to an instance of Gemini Nano in Chrome. 

# Other features
Apart from the Prompt API, there are various other APIs enabled and their individual documents that describe the feature, setting up the feature, sample code is listed below:
- [Prompt API](https://developer.chrome.com/docs/ai/built-in-apis#prompt_api)
- [Summarization API](https://docs.google.com/document/d/1Bvd6cU9VIEb7kHTAOCtmmHNAYlIZdeNmV7Oy-2CtimA/edit?tab=t.0)
- [Translation API](https://docs.google.com/document/d/1bzpeKk4k26KfjtR-_d9OuXLMpJdRMiLZAOVNMuFIejk/edit?tab=t.0)
- [Language Detection API](https://docs.google.com/document/d/1lY40hdaWizzImXaI2iCGto9sOY6s25BcDJDYQvxpvk4/edit)
- [Writer and Rewriter APIs](https://docs.google.com/document/d/1WZlAvfrIWDwzQXdqIcCOTcrWLGGgmoesN1VGFbKU_D4/edit?usp=sharing)
- [Translation API](https://docs.google.com/document/d/1bzpeKk4k26KfjtR-_d9OuXLMpJdRMiLZAOVNMuFIejk/edit)

# List of Experiments

| Folder Name    | Application  | Blog Post  |
| -------------- | ------------ | ---------- |
| [`sentiment-analysis`](sentiment-analysis) | The [Prompt API](https://developer.chrome.com/docs/ai/built-in-apis#prompt_api) is used to process the reviews provided by the user and it is classified into positive or negative.| [Get Started with Chrome Built-in AI : Access Gemini Nano Model locall](https://bit.ly/3YcMsUO) |
| [`bug-reporter`](bug-reporter) |The [Prompt API](https://developer.chrome.com/docs/ai/built-in-apis#prompt_api) is used to get the summary based on the bug description. There is a `tooltip` version that displays a tooltip with the summary, if you hover over the title or the description.| [Using Chrome Built-in AI Nano models to add AI features to existing Web Applications](https://bit.ly/3NTXfyF) |
| [`summarizer`](summarizer) | This example uses the [Summarization API](https://docs.google.com/document/d/1Bvd6cU9VIEb7kHTAOCtmmHNAYlIZdeNmV7Oy-2CtimA/edit?tab=t.0) to demonstrate how to generate summarization of different types: `tl;dr`,`key-points`, `teaser`, `headline`| [Chrome Built-in AI Experiments: Exploring the Summarization API](https://bit.ly/3Yu8TFm) |
| [`chrome-extension-summarizer`](chrome-extension-summarizer) | This example uses the [Summarization API](https://docs.google.com/document/d/1Bvd6cU9VIEb7kHTAOCtmmHNAYlIZdeNmV7Oy-2CtimA/edit?tab=t.0) via a Chrome Extension that is available as a side panel. It can be used to select any portion of text from a web page and then right-click, choose `Summarize` from the actions. This will open the Chrome Extension side panel and the results of the summarization will be displayed. | [Text Summarization Chrome Extension](https://bit.ly/3CqVO8g) |
| [`chrome-extension-code-summarization`](chrome-extension-code-summarization) | This example uses the [Prompt API](https://developer.chrome.com/docs/ai/built-in-apis#prompt_api) via a Chrome Extension that is available as a side panel. It can be used to select any portion of code from a web page and then right-click, choose `Explain this code` from the actions. This will open the Chrome Extension side panel and the results of the code explanation will be displayed. | [Code Explanation Chrome Extension](https://bit.ly/3YGeNTS) |
| [`language-demo`](language-demo) | This project demonstrates the usage of the language detection and language translation capabilities of Chrome Built-in AI. The demo lists a list of issues that have been reported by the users in their preferred languages. We first detect the language for each of the issues and then we translate it to English.| - |
| [`hashtag-generator`](hashtag-generator) | Work in Progress| - |
| [`chat`](chat) | Work in Progress| To be published |
