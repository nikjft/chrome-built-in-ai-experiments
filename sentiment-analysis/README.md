# Description
This example shows a list of reviews and we would like to do a sentiment analysis on this, all locally within the Chrome Browser.

# How it works
When the *Analyze Sentiment* button is clicked, it will go through each of the reviews and pass it on to an instances of the Prompt API, to prompt it for a review. 

# High Level code

Create the session object
```
s = await ai.languageModel.create({
            systemPrompt: "You are an expert reviewer of comments who analysis and identifies what attributes were liked or disliked in the review."
        });
```

Invoke the `prompt` function on the session object. The prompt passes in the reviewText.
```
const response = await s.prompt("Analyze the review for sentiment and identify in a list what was liked and disliked." + reviewText);
```

# Instructions to run
Load the `index.html` in the Chrome Canary version with the Built-in AI setup / configuration done. Click on `Analyze Sentiment` button. 
