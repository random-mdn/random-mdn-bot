# random-mdn-serverless

Serverless functions tweeting/sending/... random MDN articles

## Setup

```
# clone the repo and get the source code
$ git clone git@github.com:random-mdn/random-mdn-serverless.git

# install dependencies
$ npm install

# that's it. :)
```

## Structure

The project uses [the Serverless Framework](https://serverless.com/) and currently includes one function to run every six hours.

### `tweet` – scheduled function (every 6 hours)

The tweet function reads out the MDN sitemap, parses it and tweets the found article.

## Local development

To exectue the function that powers the endpoint you can run `npm run dev` inside of the project and it should execute the function locally.

It should look as follows:

```
$ npm run dev
```

## Deployment

To deploy and update the function `npm run deploy` does the job. To do so you have to have the proper rights and @stefanjudis can provide these when needed.

## Roadmap

If you would like to help :heart: that would be awesome! You can find ideas and the current planning in [the planning issue](https://github.com/random-mdn/random-mdn-serverless/issues/1).

## Code of conduct

This project follows and enforece a [Code of Conduct](./CODE-OF-CONDUCT.md) to make everybody feel welcomed and safe.
