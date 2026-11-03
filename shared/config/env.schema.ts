import { z } from 'zod';

const webBaseUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return (
    ['https:', 'http:'].includes(url.protocol) &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash &&
    url.pathname === '/'
  );
}, 'Use an HTTP(S) origin without credentials, path, query, or fragment.');

const flag = z.enum(['true', 'false']).transform((value) => value === 'true');

export const EnvironmentSchema = z
  .strictObject({
    WEB_BASE_URL: webBaseUrl,
    TEST_LOCALE: z.literal('ro-MD'),
    ALLOW_PRODUCTION_READ_ONLY: flag.default(false),
    CI: z
      .enum(['true', 'false', ''])
      .default('')
      .transform((value) => value === 'true'),
  })
  .transform((values) => ({
    webBaseUrl: values.WEB_BASE_URL,
    locale: values.TEST_LOCALE,
    allowProductionReadOnly: values.ALLOW_PRODUCTION_READ_ONLY,
    ci: values.CI,
  }));

export type Environment = z.infer<typeof EnvironmentSchema>;
export type Runtime = 'ui' | 'api' | 'e2e' | 'android' | 'ios';
