#TO DO

- Allow users to edit games
- Allow users to SOFT delete games
- Do not allow users to play their own games
- maybe add a way to reset them game so if users do not like the set of question they get
- When the user creates a new game the questions selected are not saved in the db. Save them initially even if they are empty.
- Do not alow users to play games that are not complete
- Do not allow orphan games/ sessions. Righ tnow if a user creates a game/ session and does not complete it and then the local storage is cleared, the game/ session will be lost even if they have the same user token because the game/ session are only saved to the LS onload if they are completed, otherwise the app assumes they alredy exist in the web browser data
- the view/:id renders even for unenxisting games, it should not
