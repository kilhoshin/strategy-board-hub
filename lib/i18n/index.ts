import { en } from './dictionaries/en';
import { ja } from './dictionaries/ja';
import { ko } from './dictionaries/ko';
import { zh } from './dictionaries/zh';
import type { Locale } from './config';
import type { Dictionary } from './types';

const DICTIONARIES: Record<Locale, Dictionary> = { en, ko, ja, zh };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

export type { Dictionary };
