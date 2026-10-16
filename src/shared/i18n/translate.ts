import langs, { TranslationKey } from './index';

const DEFAULT_LANG = 'es';

/**
 * Resolves a translation key for a given language, falling back to the default
 * language and then to the raw key. Supports `%s` positional placeholders.
 */
export function translate(
  lang: string = DEFAULT_LANG,
  key: TranslationKey,
  args?: (string | number)[]
): string {
  const entry = langs[key];
  if (!entry) return key;

  const dictionary = entry as Record<string, string>;
  let text = dictionary[lang] ?? dictionary[DEFAULT_LANG] ?? dictionary.en ?? key;

  if (args?.length) {
    let index = 0;
    text = text.replace(/%s/g, () => String(args[index++]));
  }

  return text;
}
