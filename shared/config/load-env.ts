import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { EnvironmentSchema } from './env.schema.js';
import type { Environment, Runtime } from './env.schema.js';
import { MOBILE_SETTINGS } from './mobile-settings.js';

type Variables = Readonly<Record<string, string | undefined>>;
let cachedEnvironment: Environment | undefined;

// Shell/CI variables override local .env values. Read the root file once;
// explicit variables allow local policy tests without loading any secrets.
export function readEnvironment(variables?: Variables): Environment {
  if (variables) return validateEnvironment(variables);
  if (cachedEnvironment) return cachedEnvironment;
  let local: Variables = {};
  try {
    local = parseEnv(
      readFileSync(new URL('../../.env', import.meta.url), 'utf8'),
    );
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
      throw error;
  }
  cachedEnvironment = validateEnvironment({ ...local, ...process.env });
  return cachedEnvironment;
}

function validateEnvironment(variables: Variables): Environment {
  if (variables.TEST_ENV !== undefined || variables.BASE_URL !== undefined) {
    throw new Error(
      'Legacy TEST_ENV/BASE_URL are unsupported. Set WEB_BASE_URL in .env or CI.',
    );
  }
  return EnvironmentSchema.parse({
    WEB_BASE_URL: variables.WEB_BASE_URL,
    API_BASE_URL: variables.API_BASE_URL,
    AUTH_BASE_URL: variables.AUTH_BASE_URL,
    TEST_ACCOUNT_USERNAME: variables.TEST_ACCOUNT_USERNAME,
    TEST_ACCOUNT_PASSWORD: variables.TEST_ACCOUNT_PASSWORD,
    ALLOW_TEST_ACCOUNT_AUTH: variables.ALLOW_TEST_ACCOUNT_AUTH,
    TEST_LOCALE: variables.TEST_LOCALE,
    ALLOW_PRODUCTION_READ_ONLY: variables.ALLOW_PRODUCTION_READ_ONLY,
    ALLOW_PUBLIC_READ_ONLY_API: variables.ALLOW_PUBLIC_READ_ONLY_API,
    ANDROID_APP_ID: variables.ANDROID_APP_ID,
    ANDROID_DEVICE_ID: variables.ANDROID_DEVICE_ID,
    ANDROID_APP_VERSION: variables.ANDROID_APP_VERSION,
    ALLOW_ANDROID_READ_ONLY: variables.ALLOW_ANDROID_READ_ONLY,
    CI: variables.CI,
  });
}

export function requireRuntime(
  environment: Environment,
  runtime: Runtime,
): void {
  if (runtime === 'android') {
    if (
      !environment.allowAndroidReadOnly ||
      !environment.androidAppId ||
      !environment.androidDeviceId ||
      !environment.androidAppVersion
    ) {
      throw new Error(
        'Android capability is disabled. It requires verified ANDROID_APP_ID, ANDROID_DEVICE_ID, ANDROID_APP_VERSION and ALLOW_ANDROID_READ_ONLY=true.',
      );
    }
    return;
  }
  // Account authentication has a separate, explicitly authorized capability.
  if (runtime === 'auth') {
    if (
      !environment.allowTestAccountAuth ||
      !environment.authBaseUrl ||
      !environment.testAccountUsername ||
      !environment.testAccountPassword
    ) {
      throw new Error(
        'Test-account authentication is disabled. It requires AUTH_BASE_URL, TEST_ACCOUNT_USERNAME, TEST_ACCOUNT_PASSWORD and ALLOW_TEST_ACCOUNT_AUTH=true.',
      );
    }
    return;
  }
  // Public API and browser runs retain separate read-only opt-ins.
  if (runtime === 'api') {
    if (!environment.allowPublicReadOnlyApi || !environment.apiBaseUrl) {
      throw new Error(
        'Public read-only API capability is disabled. It requires API_BASE_URL and ALLOW_PUBLIC_READ_ONLY_API=true.',
      );
    }
    return;
  }
  if (runtime !== 'e2e') throw new Error(`${runtime} capability is disabled.`);
  if (!environment.allowProductionReadOnly) {
    throw new Error(
      'Public read-only E2E requires ALLOW_PRODUCTION_READ_ONLY=true.',
    );
  }
}

/** Pass host tooling variables, without forwarding account credentials to Maestro. */
export function mobileProcessEnvironment(): NodeJS.ProcessEnv {
  const keys = [
    'PATH',
    'Path',
    'SystemRoot',
    'WINDIR',
    'COMSPEC',
    'TEMP',
    'TMP',
    'USERPROFILE',
    'APPDATA',
    'LOCALAPPDATA',
    'HOMEDRIVE',
    'HOMEPATH',
    'JAVA_HOME',
    'ANDROID_HOME',
    'ANDROID_SDK_ROOT',
    'HOME',
  ];
  return {
    ...Object.fromEntries(
      keys.flatMap((key) => {
        const value = process.env[key];
        return value === undefined ? [] : [[key, value]];
      }),
    ),
    MAESTRO_CLI_NO_ANALYTICS: '1',
    JAVA_TOOL_OPTIONS: MOBILE_SETTINGS.javaToolOptions,
  };
}
