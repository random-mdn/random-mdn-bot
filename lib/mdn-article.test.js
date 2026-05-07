import { expect, test } from 'vitest';
import { getArticleMetadata } from './mdn-article';

test('getArticleMetadata', async () => {
  await expect(
    getArticleMetadata('https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head'),
  ).resolves.toStrictEqual({
    title: '<code><head></code> HTML document …',
    description:
      'The <head> HTML element contains machine-readable information (metadata) about the document, like its title, scripts, and style sheets. There can be only one <head> element in an HTML document.',
    hashtags: ['#webdev', '#HTML'],
    image: 'https://developer.mozilla.org/mdn-social-image.46ac2375.png',
  });
});
