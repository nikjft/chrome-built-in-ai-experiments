# Description
This example shows a list of bugs(issues) that have been reported. We would like to do our own analysis on these bugs, starting with getting a title and summary for the bug, all locally within the Chrome Browser.

# How it works
When the *Summarize Bugs* button is clicked, it will go through each of the bugs and pass the details on to an instances of the Prompt API, to prompt it for a summary and to get a one line title for the bug. 

# High Level code

Create the session object
```
s = await ai.languageModel.create({
            systemPrompt: "You are an expert bug report summarizer."
        });
```

Invoke the `prompt` function on the session object. The prompt passes in the `bug details` i.e. the text reported by the user in the bug.
```
      //This snippet is for the summary
      const response = await s.prompt("Summarize the following bug report: " + bugDetails);

      //This snippet is for the title
      const response = await s.prompt("Provide a single line title for the following bug report.: " + bugDetails);

```

# Instructions to run
Load the `index.html` in the Chrome Canary version with the Built-in AI setup / configuration done. Click on *Summarize Bugs* button. 
