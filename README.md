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

The project uses [the Serverless Framework](https://serverless.com/) and currently provides one endpoint running in AWS. This endpoint does nothing else than responding with some JSON using a random npm package (`randomstring`).

## Local development

To exectue the function that powers the endpoint you can run `npm run dev` inside of the project and it should execute the function locally.

It should look as follows:

```
$ npm run dev

> random-mdn-serverless@1.0.0 dev /Users/stefanjudis/Projects/random-mdn-serverless
> serverless invoke local --function hello

Serverless: INVOKING INVOKE
{
    "statusCode": 200,
    "body": "{\"message\":\"Whoop whoop! Random mdn! Random: IeqRoYw7Z6hInkIqcC7hyN4Hm5pBX2qM\",\"input\":\"\"}"
}
```

## Deployment

To deploy and update the function `npm run deploy` does the job. To do so you have to have the proper rights and @stefanjudis can provide these when needed.
