'use strict';

const randomstring = require('randomstring');

module.exports.hello = async (event, context) => {
  console.log('hello from logging.');
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Whoop whoop! Random mdn! Random: ${ randomstring.generate() }`,
      input: event,
    }),
  };
};
