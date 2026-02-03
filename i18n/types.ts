/**
 * Type-safe translation keys
 * Auto-generated from English translation file
 */

import type en from './en';

// Recursively generate nested translation key paths
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

/**
 * Valid translation keys in dot notation
 * Examples: 'common.login', 'mockExam.title', 'examFlow.score'
 */
export type TranslationKey = NestedKeyOf<typeof en>;

/**
 * Type-safe translation function signature
 */
export type TranslateFn = (key: TranslationKey) => string;

/**
 * Helper type to get nested value from translation object
 */
export type TranslationValue<K extends TranslationKey> = K extends keyof typeof en
  ? typeof en[K]
  : K extends `${infer P}.${infer R}`
  ? P extends keyof typeof en
    ? R extends keyof typeof en[P]
      ? typeof en[P][R]
      : never
    : never
  : never;
