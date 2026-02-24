import { expect, test } from 'vitest';
import { getArticleMetadata } from './mdn-article';

test('getArticleMetadata', async () => {
  await expect(
    getArticleMetadata('https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head'),
  ).resolves.toStrictEqual({
    title: '<head>: The Document Metadata (Hea…',
    description:
      'The <head> HTML element contains machine-readable information (metadata) about the document, like its title, scripts, and style sheets. There can be only one <head> element in an HTML document.',
    hashtags: ['#webdev', '#HTML'],
    image: 'https://developer.mozilla.org/mdn-social-image.46ac2375.png',
  });
});
