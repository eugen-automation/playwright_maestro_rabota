import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { readEnvironment } from '../shared/config/load-env.js';
import { runMobile } from '../shared/utils/mobile-runner.js';
import { validateMobileWorkspace } from '../shared/utils/mobile-workspace.js';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
  const { values } = parseArgs({
    options: {
      check: { type: 'boolean', default: false },
      platform: { type: 'string' },
      suite: { type: 'string' },
      flow: { type: 'string' },
    },
  });
  if (values.check) {
    const flows = validateMobileWorkspace(root);
    console.log(
      `Validated ${flows.length} native flow(s). This is not device execution.`,
    );
  } else {
    runMobile(root, readEnvironment(), {
      platform: values.platform,
      ...(values.suite ? { suite: values.suite } : {}),
      ...(values.flow ? { flow: values.flow } : {}),
    });
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Mobile execution failed.',
  );
  process.exitCode = 1;
}
