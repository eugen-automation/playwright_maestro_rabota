// Synthetic validation inputs only: these selectors/IDs are not Rabota contracts.
const header = 'appId: ${APP_ID}';
const ordinaryCommands =
  '- runFlow: ../../subflows/launch-app.yaml\n- assertVisible: Synthetic ready';
const top = `${header}\nname: Synthetic launch\ntags: [smoke, navigation, read-only, android-only]\n---\n${ordinaryCommands}\n`;
const launch = `${header}\n---\n- launchApp:\n    clearState: false\n    permissions: {}\n- assertVisible: Synthetic ready\n`;
const web = {
  WEB_BASE_URL: 'https://configured.example',
  TEST_LOCALE: 'ro-MD',
} as const;
const android = {
  ...web,
  ANDROID_APP_ID: 'example.synthetic.app',
  ANDROID_DEVICE_ID: 'synthetic-device-1',
  ANDROID_APP_VERSION: '1.0-synthetic',
  ALLOW_ANDROID_READ_ONLY: 'true',
} as const;

export const MOBILE_RUNNER_CASES = {
  vacancy: {
    card: 'Senior C++ (Angular) [Remote]\nSynthetic employer (QA)\nSynthetic city\nActualizat: 2 minute în urmă',
    title: 'Senior C++ (Angular) [Remote]',
    changedTimestamp:
      'Senior C++ (Angular) [Remote]\nSynthetic employer (QA)\nSynthetic city\nActualizat: 3 minute în urmă',
    otherEmployer:
      'Senior C++ (Angular) [Remote]\nAnother synthetic employer\nSynthetic city\nActualizat: 3 minute în urmă',
  },
  devicePolicies: {
    unlocked: '  showing=false\n  inputRestricted=false\n',
    locked: '  showing=true\n  inputRestricted=true\n',
    restricted: '  showing=false\n  inputRestricted=true\n',
    unknown: 'Unsupported keyguard report format',
  },
  top,
  launch,
  web,
  android,
  paths: {
    flow: 'mobile/flows/navigation/synthetic.yaml',
    launch: 'mobile/subflows/launch-app.yaml',
  },
  config:
    'flows: ["flows/**"]\nexcludeTags: [logged-out, state-reset, destructive, flaky]\n',
  unsafeLaunch: [
    `${header}\n---\n- launchApp\n`,
    `${header}\n---\n- launchApp:\n    clearState: false\n    permissions: { all: allow }\n`,
    `${header}\n---\n- launchApp:\n    clearState: true\n`,
    `${header}\n---\n- clearState\n`,
    `${header}\n---\n- launchApp:\n    clearState: false\n    clearKeychain: true\n`,
    `${header}\n---\n- runFlow:\n    commands:\n      - clearState\n`,
    `${header}\n---\n- runScript: ../../outside.js\n`,
    `${header}\n---\n- launchApp:\n    clearState: false\n    appId: example.other.app\n`,
  ],
  invalidTop: [
    top.replace(
      'name: Synthetic launch',
      "name: 'Synthetic: invalid Windows artifact name'",
    ),
    top.replace('smoke,', 'smoke, regression,'),
    top.replace('smoke,', 'smoke, state-reset,'),
    top.replace('android-only', 'ios-only'),
    top.replace('navigation,', ''),
    top.replace(header, 'appId: example.synthetic.app'),
    top.replace('---', 'env: { APP_ID: example.other.app }\n---'),
    top.replace('---', 'env: { PASSWORD: synthetic-value }\n---'),
  ],
  cyclicLaunch: `${header}\n---\n- runFlow: launch-app.yaml\n`,
  escapedLaunch: `${header}\n---\n- runFlow: ../flows/navigation/synthetic.yaml\n`,
  traversal: 'mobile/flows/navigation/../../auth/write.yaml',
} as const;
