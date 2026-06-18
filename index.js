'use strict';

/**
 * Browser automation DSL runner using Taiko.
 *
 * Replaces the Claude CLI screenshot-observe-act loop with direct
 * browser control. Elements are located by their visible text/label
 * instead of pixel coordinates, making this resilient to layout changes.
 *
 * Usage:
 *   node index.js                        # interactive (type commands)
 *   node index.js --task <file.txt>      # load steps from a text file
 *
 * Supported commands (one per line):
 *   navigate <url>
 *   click <label>
 *   type <label> <text>
 *   select <label> <option>
 *   press <key>
 *   scroll down|up
 *   screenshot [label]
 *   waitFor <text>
 *   assertText <text>
 *   loginAs
 *   sleep <ms>
 *   done
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Suppress noisy Taiko heading update messages
process.env.TAIKO_SKIP_HEADING_UPDATE = 'true';

let taiko;
try {
  taiko = require('taiko');
} catch {
  console.error('Error: taiko is not installed. Run: npm install');
  process.exit(1);
}

const {
  openBrowser,
  closeBrowser,
  goto,
  click,
  write,
  into,
  textBox,
  press,
  scrollDown,
  scrollUp,
  screenshot,
  waitFor,
  text,
  dropDown,
  $,
} = taiko;

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const SCREENSHOT_QLTY = 70;
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

// --- DSL Parser ---

/**
 * Splits a string into tokens, respecting double and single quoted strings.
 * e.g. `Search "hello world"` → ['Search', 'hello world']
 */
function parseArgs(str) {
  const args = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';
  let bracketDepth = 0;

  for (const ch of str) {
    if (inQuote) {
      if (ch === quoteChar) { args.push(current); current = ''; inQuote = false; }
      else current += ch;
    } else if (ch === '[') {
      bracketDepth++;
      current += ch;
    } else if (ch === ']') {
      bracketDepth--;
      current += ch;
    } else if ((ch === '"' || ch === "'") && bracketDepth === 0) {
      if (current) { args.push(current); current = ''; }
      inQuote = true;
      quoteChar = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (current) { args.push(current); current = ''; }
    } else {
      current += ch;
    }
  }
  if (current) args.push(current);
  return args;
}

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return { cmd: trimmed.toLowerCase(), args: [] };

  const cmd = trimmed.slice(0, spaceIdx).toLowerCase();
  const rest = trimmed.slice(spaceIdx + 1).trim();
  return { cmd, args: parseArgs(rest) };
}

// --- Step Executor ---

/**
 * Execute a single parsed DSL step.
 * Returns 'done' to signal task completion, null otherwise.
 */
async function executeStep({ cmd, args }) {
  switch (cmd) {
    case 'navigate':
    case 'goto':
      await goto(args[0]);
      break;

    case 'click': {
      // Supports text labels ("click Sign In") and CSS selectors ("click #btn")
      const target = args.join(' ');
      const isCss = target.startsWith('#') || target.startsWith('.') || target.startsWith('[');
      await click(isCss ? $(target) : target);
      break;
    }

    case 'type':
    case 'fill': {
      // type <label> <text>  — label is args[0], text is the rest
      // Supports:
      //   type Search "hello"          → finds by visible label / aria-label / placeholder
      //   type [name="q"] "hello"      → CSS attribute selector
      //   type #myId "hello"           → CSS id selector
      const label = args[0];
      const value = args.slice(1).join(' ');
      const isCssSelector = label.startsWith('#') || label.startsWith('.') || label.startsWith('[');
      if (isCssSelector) {
        await write(value, into($(label)));
      } else {
        try {
          await write(value, into(textBox(label)));
        } catch {
          // Fallback: match by aria-label, name, or placeholder attribute
          await write(value, into($(`[aria-label="${label}"], [name="${label}"], [placeholder="${label}"]`)));
        }
      }
      break;
    }

    case 'select': {
      // select <label> <option>
      const label = args[0];
      const option = args.slice(1).join(' ');
      await dropDown(label).select(option);
      break;
    }

    case 'press':
      // e.g. press Enter, press Tab, press ctrl+a
      await press(args[0]);
      break;

    case 'scroll':
      if (args[0] && args[0].toLowerCase() === 'up') await scrollUp();
      else await scrollDown();
      break;

    case 'screenshot': {
      const label = args[0] ? `_${args[0]}` : '';
      const screenshotPath = path.join(SCREENSHOT_DIR, `taiko_screenshot${label}_${Date.now()}.jpeg`);
      await screenshot({ path: screenshotPath, quality: SCREENSHOT_QLTY });
      console.log(`  Saved: ${screenshotPath}`);
      break;
    }

    case 'waitfor': {
      // waitFor <visible text> — waits until that text appears on the page
      const label = args.join(' ');
      await waitFor(text(label));
      break;
    }

    case 'sleep': {
      const ms = parseInt(args[0], 10) || 1000;
      await new Promise(resolve => setTimeout(resolve, ms));
      break;
    }

    case 'asserttext': {
      const label = args.join(' ');
      const exists = await text(label).exists();
      if (!exists) throw new Error(`Assertion failed: text "${label}" not found on page`);
      break;
    }

    case 'loginas': {
      const { login } = require('./helpers/auth');
      await login();
      break;
    }

    case 'done':
      return 'done';

    default:
      console.warn(`  Unknown command "${cmd}" — skipping`);
  }
  return null;
}

// --- Task Loader ---

async function loadSteps() {
  const taskFlagIdx = process.argv.indexOf('--task');
  if (taskFlagIdx !== -1 && process.argv[taskFlagIdx + 1]) {
    const filePath = path.resolve(process.argv[taskFlagIdx + 1]);
    if (!fs.existsSync(filePath)) {
      console.error(`Task file not found: ${filePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').map(parseLine).filter(Boolean);
  }

  // Interactive mode — read from stdin
  const isTTY = process.stdin.isTTY;
  if (isTTY) {
    console.log('Enter commands (one per line). Type "done" to run.\n');
    console.log('Commands: navigate, click, type, select, press, scroll, screenshot, waitFor, assertText, loginAs, sleep, done\n');
  }

  const rl = readline.createInterface({ input: process.stdin, output: isTTY ? process.stdout : null, terminal: isTTY });
  const steps = [];

  if (isTTY) process.stdout.write('> ');
  for await (const line of rl) {
    const step = parseLine(line);
    if (step) steps.push(step);
    if (step && step.cmd === 'done') break;
    if (isTTY) process.stdout.write('> ');
  }
  return steps;
}

// --- Main ---

async function main() {
  const steps = await loadSteps();

  if (steps.length === 0) {
    console.error('No steps provided. Exiting.');
    process.exit(1);
  }

  console.log(`\nStarting browser (${steps.length} step${steps.length > 1 ? 's' : ''})...\n`);
  await openBrowser({ headless: false });

  let stepNum = 0;
  try {
    for (const step of steps) {
      stepNum++;
      const display = `${step.cmd} ${step.args.join(' ')}`.trim();
      process.stdout.write(`[${stepNum}/${steps.length}] ${display} ... `);
      const result = await executeStep(step);
      console.log('ok');
      if (result === 'done') {
        console.log('\nTask completed.');
        break;
      }
    }
  } catch (err) {
    console.log('FAILED');
    console.error(`\nError at step ${stepNum}: ${err.message}`);
    const errPath = path.join(SCREENSHOT_DIR, `taiko_error_${Date.now()}.jpeg`);
    try {
      await screenshot({ path: errPath, quality: SCREENSHOT_QLTY });
      console.error(`Error screenshot: ${errPath}`);
    } catch { /* ignore screenshot errors */ }
    process.exitCode = 1;
  } finally {
    await closeBrowser();
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
