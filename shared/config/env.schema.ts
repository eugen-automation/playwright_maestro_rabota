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
    AUTH_BASE_URL: ServiceOriginSchema.optional(),
    TEST_ACCOUNT_USERNAME: z.string().min(1).optional(),
    TEST_ACCOUNT_PASSWORD: z.string().min(1).optional(),
    ALLOW_TEST_ACCOUNT_AUTH: flag.default(false),
    TEST_LOCALE: z.literal('ro-MD'),
    ALLOW_PRODUCTION_READ_ONLY: flag.default(false),
    ALLOW_PUBLIC_READ_ONLY_API: flag.default(false),
    ANDROID_APP_ID: z
      .string()
      .regex(/^[A-Za-z][\w]*(?:\.[A-Za-z][\w]*)+$/u)
      .optional(),
    ANDROID_DEVICE_ID: z
      .string()
      .regex(/^[A-Za-z0-9_.:-]+$/u)
      .optional(),
    ANDROID_APP_VERSION: z.string().trim().min(1).max(100).optional(),
    ALLOW_ANDROID_READ_ONLY: flag.default(false),
    CI: z
      .enum(['true', 'false', ''])
      .default('')
      .transform((value) => value === 'true'),
  })
  .superRefine((values, context) => {
    if (
      values.AUTH_BASE_URL &&
      new URL(values.AUTH_BASE_URL).origin !==
        new URL(values.WEB_BASE_URL).origin
    ) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_BASE_URL'],
        message:
          'Test-account authentication must use the explicitly configured web origin.',
      });
    }
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
    authBaseUrl: values.AUTH_BASE_URL,
    testAccountUsername: values.TEST_ACCOUNT_USERNAME,
    testAccountPassword: values.TEST_ACCOUNT_PASSWORD,
    allowTestAccountAuth: values.ALLOW_TEST_ACCOUNT_AUTH,
    locale: values.TEST_LOCALE,
    allowProductionReadOnly: values.ALLOW_PRODUCTION_READ_ONLY,
    allowPublicReadOnlyApi: values.ALLOW_PUBLIC_READ_ONLY_API,
    androidAppId: values.ANDROID_APP_ID,
    androidDeviceId: values.ANDROID_DEVICE_ID,
    androidAppVersion: values.ANDROID_APP_VERSION,
    allowAndroidReadOnly: values.ALLOW_ANDROID_READ_ONLY,
    ci: values.CI,
  }));

export type Environment = z.infer<typeof EnvironmentSchema>;
export type Runtime = 'ui' | 'api' | 'auth' | 'e2e' | 'android' | 'ios';
