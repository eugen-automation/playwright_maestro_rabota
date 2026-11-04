// Add app flows only after inspecting their native actions on the installed build.
const reviewedReadOnlyFlows: readonly string[] = [
  'mobile/flows/navigation/launch.yaml',
  'mobile/flows/search/keyword-picker.yaml',
  'mobile/flows/search/keyword-results.yaml',
  'mobile/flows/navigation/background-resume.yaml',
  'mobile/flows/jobs/vacancy-navigation.yaml',
  'mobile/flows/search/city-selection.yaml',
];

export const MOBILE_SETTINGS = {
  maestroVersion: '2.11.0',
  javaToolOptions:
    '-Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8',
  workspace: 'mobile',
  config: 'mobile/config.yaml',
  reportRoot: 'reports/mobile/android',
  reviewedReadOnlyFlows,
  reviewedScripts: ['mobile/scripts/capture-public-vacancy.js'],
  excludedTags: ['logged-out', 'state-reset', 'destructive', 'flaky'],
  timeouts: { tooling: 30_000, run: 180_000 },
  // Deliberately narrow for the first public read-only native increment.
  commands: [
    'launchApp',
    'stopApp',
    'assertVisible',
    'assertNotVisible',
    'tapOn',
    'inputText',
    'eraseText',
    'hideKeyboard',
    'back',
    'runFlow',
    'extendedWaitUntil',
    'waitForAnimationToEnd',
    'scrollUntilVisible',
    'copyTextFrom',
    'runScript',
    'pressKey',
  ],
} as const;
