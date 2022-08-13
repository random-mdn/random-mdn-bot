import { expect, test } from 'vitest';
import { getTitleAndDescription } from './helpers';

test('getTitleAndDescription', async () => {
  await expect(
    getTitleAndDescription(
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head'
    )
  ).resolves.toStrictEqual([
    '<head>: The Document Metadata (Hea…',
    'The <head> HTML element contains machine-readable information (metadata) about the document, like its title, scripts, and style sheets.',
  ]);
});
