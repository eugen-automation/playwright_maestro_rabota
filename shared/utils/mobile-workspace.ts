import { readFileSync, readdirSync, realpathSync, existsSync } from 'node:fs';
import {
  dirname,
  resolve,
  relative,
  isAbsolute,
  sep,
  basename,
} from 'node:path';
import { parseAllDocuments } from 'yaml';
import { z } from 'zod';
import { MOBILE_SETTINGS } from '../config/mobile-settings.js';

const ObjectSchema = z.record(z.string(), z.unknown());
const HeaderSchema = z.object({
  appId: z.literal('${APP_ID}'),
  name: z
    .string()
    .min(1)
    .refine(
      (value) =>
        !['<', '>', ':', '"', '/', '\\', '|', '?', '*'].some((character) =>
          value.includes(character),
        ),
      'Flow names must be valid artifact directory names on Windows.',
    )
    .optional(),
  tags: z.array(z.string()).default([]),
  env: z.record(z.string(), z.string()).optional(),
});
const ConfigSchema = z.strictObject({
  flows: z.tuple([z.literal('flows/**')]),
  excludeTags: z.array(z.string()),
});

function yamlValues(path: string): unknown[] {
  return parseAllDocuments(readFileSync(path, 'utf8')).map((document) => {
    if (document.errors.length || document.warnings.length)
      throw new Error(`Invalid YAML: ${path}`);
    const value: unknown = document.toJS({ maxAliasCount: 0 });
    return value;
  });
}

function containedPath(root: string, file: string): string {
  const absolute = realpathSync(file);
  const offset = relative(realpathSync(root), absolute);
  if (offset === '..' || offset.startsWith(`..${sep}`) || isAbsolute(offset))
    throw new Error(
      'Mobile flow paths must remain inside their owning directory.',
    );
  return absolute;
}

export type MobileFlow = Readonly<{
  path: string;
  suite: 'smoke' | 'regression';
}>;

/** Validate every referenced helper before selecting a read-only suite. */
export function validateMobileWorkspace(root: string): MobileFlow[] {
  const mobile = resolve(root, MOBILE_SETTINGS.workspace);
  const configValues = yamlValues(resolve(root, MOBILE_SETTINGS.config));
  if (configValues.length !== 1)
    throw new Error('Expected one Maestro workspace config.');
  const config = ConfigSchema.parse(configValues[0]);
  if (
    MOBILE_SETTINGS.excludedTags.some(
      (tag) => !config.excludeTags.includes(tag),
    )
  )
    throw new Error('Protected Maestro exclusions must remain enabled.');
  const flowRoot = resolve(mobile, 'flows');
  if (!existsSync(flowRoot))
    throw new Error(
      'No verified native flows exist yet; install and inspect the app first.',
    );
  const files = readdirSync(flowRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.ya?ml$/u.test(entry.name))
    .map((entry) => resolve(entry.parentPath, entry.name));
  if (!files.length)
    throw new Error(
      'The mobile suite is empty; no passing coverage is implied.',
    );

  const inspect = (
    file: string,
    ancestors: Set<string>,
    topLevel: boolean,
  ): MobileFlow => {
    const absolute = containedPath(
      topLevel ? flowRoot : resolve(mobile, 'subflows'),
      file,
    );
    if (ancestors.has(absolute))
      throw new Error('Cyclic Maestro subflow reference.');
    const branch = new Set([...ancestors, absolute]);
    const values = yamlValues(absolute);
    if (values.length !== 2)
      throw new Error(`Expected header and command documents: ${absolute}`);
    const rawHeader = ObjectSchema.parse(values[0]);
    const header = HeaderSchema.parse(rawHeader);
    if (
      Object.keys(rawHeader).some(
        (key) => !['appId', 'name', 'tags', 'env'].includes(key),
      )
    )
      throw new Error(
        'Unsupported mobile header; review hooks/config before enabling.',
      );
    for (const key of Object.keys(header.env ?? {})) {
      if (
        ['APP_ID', 'API_BASE_URL', 'WEB_BASE_URL'].includes(key) ||
        /SECRET|TOKEN|PASSWORD|CREDENTIAL/iu.test(key)
      )
        throw new Error(
          'Flow env must not override shared configuration or contain secrets.',
        );
    }
    const tags = header.tags;
    if (MOBILE_SETTINGS.excludedTags.some((tag) => tags.includes(tag)))
      throw new Error(
        'Protected flows are unavailable in the read-only runner.',
      );
    const suites = tags.filter(
      (tag) => tag === 'smoke' || tag === 'regression',
    );
    const suite = suites[0];
    if (topLevel) {
      const feature = basename(dirname(absolute));
      if (
        relative(flowRoot, absolute).split(sep).length !== 2 ||
        !header.name ||
        suites.length !== 1 ||
        !tags.includes(feature) ||
        !tags.includes('read-only') ||
        !tags.includes('android-only')
      )
        throw new Error(
          'Native tests require name, feature, one suite, read-only and android-only tags.',
        );
    }
    const commands = z.array(z.unknown()).min(1).parse(values[1]);
    if (
      topLevel &&
      ObjectSchema.parse(commands[0]).runFlow !==
        '../../subflows/launch-app.yaml'
    )
      throw new Error(
        'Ordinary flows must begin with the shared launch helper.',
      );

    const inspectCommands = (items: unknown[]): void => {
      for (const item of items) {
        const command =
          typeof item === 'string'
            ? item
            : Object.keys(ObjectSchema.parse(item))[0];
        if (
          !command ||
          !MOBILE_SETTINGS.commands.some((allowed) => allowed === command)
        )
          throw new Error(
            `Unsupported command in read-only flow: ${command ?? 'empty'}`,
          );
        if (typeof item === 'string') {
          if (['runScript', 'copyTextFrom', 'pressKey'].includes(item))
            throw new Error(
              'Unsupported command without validated parameters.',
            );
          if (item === 'launchApp')
            throw new Error(
              'Read-only launch must preserve app state and permissions explicitly.',
            );
          continue;
        }
        const mapping = ObjectSchema.parse(item);
        if (Object.keys(mapping).length !== 1)
          throw new Error('Expected one command per YAML item.');
        const value = mapping[command];
        if (command === 'pressKey' && value !== 'Home')
          throw new Error(
            'Only the reviewed background/resume Home key is supported.',
          );
        if (command === 'runScript') {
          const script = resolve(dirname(absolute), z.string().parse(value));
          const scriptName = relative(root, script).split(sep).join('/');
          if (
            !MOBILE_SETTINGS.reviewedScripts.some(
              (approved) => approved === scriptName,
            )
          )
            throw new Error(
              'Unsupported command script: only inspected Maestro-compatible scripts can run.',
            );
          containedPath(resolve(mobile, 'scripts'), script);
        }
        if (command === 'stopApp')
          throw new Error(
            'Use the plain stopApp command so the configured app remains the only target.',
          );
        if (command === 'launchApp') {
          const options = ObjectSchema.parse(value);
          const permissions = ObjectSchema.safeParse(options.permissions);
          if (
            options.clearState !== false ||
            Object.keys(options).some(
              (key) => !['clearState', 'stopApp', 'permissions'].includes(key),
            ) ||
            !permissions.success ||
            Object.keys(permissions.data).length !== 0
          )
            throw new Error(
              'Read-only launch must preserve app state and configured APP_ID.',
            );
        }
        if (command === 'runFlow') {
          if (typeof value === 'string')
            inspect(resolve(dirname(absolute), value), branch, false);
          else {
            const helper = z
              .strictObject({
                when: z.record(z.string(), z.unknown()).optional(),
                file: z.string().optional(),
                commands: z.array(z.unknown()).optional(),
              })
              .parse(value);
            if (!!helper.file === !!helper.commands)
              throw new Error(
                'runFlow needs exactly one file or inline commands.',
              );
            if (helper.file)
              inspect(resolve(dirname(absolute), helper.file), branch, false);
            if (helper.commands) inspectCommands(helper.commands);
          }
        }
      }
    };
    inspectCommands(commands);
    return {
      path: relative(root, absolute).split(sep).join('/'),
      suite: suite === 'regression' ? 'regression' : 'smoke',
    };
  };
  return files.map((file) => inspect(file, new Set(), true));
}
