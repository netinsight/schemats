# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

Steps to contribute:

- Make your awesome changes
- Run `npm run lint`
- Run unit test `npm run test`
- Run integration test:
  ```
  docker compose up -d
  npm run test:integration
  ```
- Submit pull request

Our project runs `npm run test` automatically on pull requests via GitHub Actions.
