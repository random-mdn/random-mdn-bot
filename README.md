# random-mdn-bot

> A bot that posts random MDN articles

[![Static Badge](https://img.shields.io/badge/Random-MDN-black?logo=bluesky)](https://bsky.app/profile/random-mdn.bsky.social)


The project uses [GitHub Actions](https://docs.github.com/actions) to run a [Node.js](https://nodejs.org/) script every six hours. 

The script reads out the [MDN](https://mdn.dev) sitemap, parses it and posts the found article to [Bluesky](https://bsky.app/profile/random-mdn.bsky.social).

## Setup

```shell
# clone the repo and get the source code
git clone git@github.com:random-mdn/random-mdn-bot.git

# install dependencies
npm install

# setup env
cp .env.example .env
```

## Local development

To execute the script locally run `npm run dev` in the project's directory.

It should look as follows:

```shell
npm run dev
```

## CLI options

#### Dry run

Run the function without posting the article.

```shell
npm run dev -- --dry-run
```

## Roadmap

If you would like to help :heart: that would be awesome! You can find ideas and the current planning in [the planning issue](https://github.com/random-mdn/random-mdn-bot/issues/1).

## Code of conduct

This project follows and enforece a [Code of Conduct](./CODE-OF-CONDUCT.md) to make everybody feel welcomed and safe.