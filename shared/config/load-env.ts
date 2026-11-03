import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { EnvironmentSchema } from './env.schema.js';
import type { Environment, Runtime } from './env.schema.js';

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
    TEST_LOCALE: variables.TEST_LOCALE,
    ALLOW_PRODUCTION_READ_ONLY: variables.ALLOW_PRODUCTION_READ_ONLY,
    CI: variables.CI,
  });
}

export function requireRuntime(
  environment: Environment,
  runtime: Runtime,
): void {
  // Every current target is treated as production/read-only. Changing a URL
  // cannot enable writes; additional layers need a deliberate implementation.
  if (runtime !== 'e2e') throw new Error(`${runtime} capability is disabled.`);
  if (!environment.allowProductionReadOnly) {
    throw new Error(
      'Public read-only E2E requires ALLOW_PRODUCTION_READ_ONLY=true.',
    );
  }
}
