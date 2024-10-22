# Description
This example shows a list of bugs(issues) that have been reported. We would like to do our own analysis on these bugs, starting with getting a title and summary for the bug, all locally within the Chrome Browser.

# How it works
When the *Summarize Bugs* button is clicked, it will go through each of the bugs and pass the details on to an instances of the Prompt API, to prompt it for a summary and to get a one line title for the bug. 

# High Level code

We create two session objects, one from the Prompt API (used to generate the Title) and the other for the Summarizer API (used to generate the Summary)
```
        promptModel = await ai.languageModel.create({
            systemPrompt: "You are an expert bug report summarizer."
        });

        summarizer = await ai.summarizer.create();
```

The summarization and generating the title tag code snippets are as shown:
```
      //This snippet is for the summary
      const response = await summarizer.summarize("Summarize the following bug report: " + bugDetails);

      //This snippet is for the title
      const response = await promptModel.prompt("Provide a single line title for the following bug report.: " + bugDetails);

```

# Instructions to run
Load the `index.html` in the Chrome Canary version with the Built-in AI setup / configuration done. Click on *Summarize Bugs* button. 
