const got = require('got');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
/**
 * Read out <h1> and meta description for URL and check if the url holds a deprecated entry
 * We use the <h1> rather than the <title> as the title is a little more verbose
 *
 * @param {String} url
 * @returns {Promise} Array of h1 and description for the documented URL
 */
const getTitleAndDescription = async (url) => {
  const DESCRIPTION_REGEX = /<meta name="description" content="(.*?)"\/>/i;
  const TITLE_REGEX = /<h1>(.*?)<\/h1>/i;
  // to not rely on exact words this matches the deprecation container
  const DEPRECATION_REGEX = /class="notecard deprecated"/;

  const { body: doc } = await got(url);

  if (DEPRECATION_REGEX.test(doc)) {
    return [null, null];
  }

  const titleMatch = doc.match(TITLE_REGEX);

  if (!titleMatch) {
    return [null, null];
  }

  let [, title] = titleMatch;

  if (title.length > 40) {
    title = title.slice(0, 40) + '…';
  }

  const descriptionMatch = doc.match(DESCRIPTION_REGEX);

  if (!descriptionMatch) {
    return [null, null];
  }

  let [, description] = descriptionMatch;

  return [entities.decode(title), entities.decode(description)];
};

module.exports = {
  getTitleAndDescription,
};
