import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'src', 'styles', 'themes');
const files = readdirSync(root)
  .filter((file) => file.endsWith('.css'))
  .sort();
const pairs = [
  ['color-text', 'color-surface'],
  ['color-text-muted', 'color-surface'],
  ['color-accent', 'color-text-inverse'],
  ['color-success', 'color-surface'],
  ['color-warning', 'color-surface'],
  ['color-error', 'color-surface'],
  ['color-info', 'color-surface'],
];

function luminance(hex: string | undefined): number | null {
  const channels: number[] | undefined = hex
    ?.slice(1)
    .match(/.{2}/g)
    ?.map((channel: string) => Number.parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3) return null;
  const linear = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string | undefined, background: string | undefined): number | null {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  if (foregroundLuminance === null || backgroundLuminance === null) return null;
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

let failures = 0;
console.log('Theme/mode contrast (WCAG AA normal text target: 4.5:1)');
console.log('Theme/mode            Pair                         Ratio   Result');

for (const file of files) {
  const source = readFileSync(join(root, file), 'utf8');
  for (const mode of ['dark', 'light']) {
    const block = source.match(
      new RegExp(
        `\\[data-theme=['"][^'"]+['"]\\]\\[data-mode=['"]${mode}['"]\\]\\s*\\{([\\s\\S]*?)\\}`,
      ),
    )?.[1];
    if (!block) continue;
    const tokens: Record<string, string> = Object.fromEntries(
      [...block.matchAll(/--(color-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((match) => [
        match[1],
        match[2],
      ]),
    );
    for (const [foreground, background] of pairs) {
      const ratio = contrast(tokens[foreground], tokens[background]);
      if (ratio === null) continue;
      const passed = ratio >= 4.5;
      if (!passed) failures += 1;
      console.log(
        `${file.replace('.css', '').padEnd(20)} ${mode.padEnd(6)} ${foreground}/${background}` +
          ` ${ratio.toFixed(2).padStart(6)}:1   ${passed ? 'PASS' : 'FAIL'}`,
      );
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} contrast pair(s) failed WCAG AA.`);
  process.exitCode = 1;
} else {
  console.log('\nAll checked token pairs pass WCAG AA.');
}
