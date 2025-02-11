# Question Bank

In this directory, add as many .json files as you wish each with the following format:
1. A JSON Array of:
    2. Question Structs, containing at least:
        1. "question": "String containing the civics question to ask"
        2. "rightAnswers": ["An array containing right answers.", "optionally, more than one"]
        3. "wrongAnswers": ["An array containing", "any number of", "wrong answers"]
        4. "difficulty": A number between 0-100 indicating the difficulty of the question