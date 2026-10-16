import general from './langs/general';
import server from './langs/server';
import validators from './langs/validators';

/**
 * Combined dictionary of every translation key available in the app.
 * Adding a new namespace: create the file in ./langs and spread it here once.
 */
const langs = {
  ...validators,
  ...general,
  ...server,
};

export default langs;
export type TranslationKey = keyof typeof langs;
