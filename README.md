# Flex DYP Rankings

This consists of two parts:

- an update job
    - runs on Node
    - fetches data (tournament results) from the Kickertool API (https://docs.api.tournament.io/)
    - transforms the data as we need it
    - stores the result in a JSON file in this Git repo
    - this job runs every Friday night in GitHub Actions
- a website
    - uses React and Tailwind
    - hosted via GitHub pages
    - fetches the JSON file with the tournament rankings that the update job stores
    - displays the current rankings as computed from the tournament results
