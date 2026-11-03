import { z } from 'zod';

export const ServiceOriginSchema = z.url().refine((value) => {
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
    WEB_BASE_URL: ServiceOriginSchema,
    API_BASE_URL: ServiceOriginSchema.optional(),
    TEST_LOCALE: z.literal('ro-MD'),
    ALLOW_PRODUCTION_READ_ONLY: flag.default(false),
    ALLOW_PUBLIC_READ_ONLY_API: flag.default(false),
    CI: z
      .enum(['true', 'false', ''])
      .default('')
      .transform((value) => value === 'true'),
  })
  .superRefine((values, context) => {
    if (
      values.API_BASE_URL &&
      new URL(values.API_BASE_URL).origin !==
        new URL(values.WEB_BASE_URL).origin
    ) {
      context.addIssue({
        code: 'custom',
        path: ['API_BASE_URL'],
        message: 'The observed public API must use the configured web origin.',
      });
    }
  })
  .transform((values) => ({
    webBaseUrl: values.WEB_BASE_URL,
    apiBaseUrl: values.API_BASE_URL,
    locale: values.TEST_LOCALE,
    allowProductionReadOnly: values.ALLOW_PRODUCTION_READ_ONLY,
    allowPublicReadOnlyApi: values.ALLOW_PUBLIC_READ_ONLY_API,
    ci: values.CI,
  }));

export type Environment = z.infer<typeof EnvironmentSchema>;
export type Runtime = 'ui' | 'api' | 'e2e' | 'android' | 'ios';
