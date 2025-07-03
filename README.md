# random-mdn-bot

A bot that posts random MDN articles

## Setup

```
# clone the repo and get the source code
$ git clone git@github.com:random-mdn/random-mdn-bot.git

# install dependencies
$ npm install

# setup env
$ cp .env.example .env

# that's it. :)
```

## Structure

The project uses [GitHub Actions](https://docs.github.com/actions) to run a [Node.js](https://nodejs.org/) function every six hours.

The function reads out the MDN sitemap, parses it and posts the found article to [Bluesky](https://bsky.app/profile/random-mdn.bsky.social).

## Local development

To run the function you can run `npm run dev` inside of the project and it should execute the function locally.

It should look as follows:

```
$ npm run dev
```

## CLI options

#### Dry run

```shell

# Run the function without posting the article
npm run dev -- --dry-run
```

## Roadmap

If you would like to help :heart: that would be awesome! You can find ideas and the current planning in [the planning issue](https://github.com/random-mdn/random-mdn-serverless/issues/1).

## Code of conduct

This project follows and enforece a [Code of Conduct](./CODE-OF-CONDUCT.md) to make everybody feel welcomed and safe.