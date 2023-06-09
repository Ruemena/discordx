# Pagination

Errors around `@discord/pagination` package.

## Missing Intent: GUILD_MESSAGES

Without the `GUILD_MESSAGES` Intent, pagination does not work. In order to properly use it, you must add it to the array of Intents  you pass to the Client. 
