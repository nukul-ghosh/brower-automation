'use strict';

const { goto, click, write, into, waitFor, text, $, clear, textBox } = require('taiko');
const { launchBrowser, quitBrowser, captureScreenshot, captureErrorScreenshot } = require('../../helpers/browser');
const { login } = require('../../helpers/auth');
const config = require('../../helpers/env');
const sel = require('../../helpers/selectors');

const TEST_TASK_TITLE = `Test Task ${Date.now()}`;
const EDITED_SUFFIX = ' (edited)';

async function createTask() {
  console.log('\n--- CREATE TASK ---');

  // Navigate to Tasks section
  await click(text(sel.app.tasksLink));
  await waitFor(text(sel.tasks.createButton), 10000);

  // Click create button
  await click(text(sel.tasks.createButton));
  await captureScreenshot('task-create-form');

  // Fill in task title — PLACEHOLDER selector, update after screenshots
  await write(TEST_TASK_TITLE, into($(sel.tasks.titleField)));

  // Save
  await click(text(sel.tasks.saveButton));
  await waitFor(text(sel.tasks.successMessage), 10000);
  await captureScreenshot('task-created');

  console.log(`  Created task: ${TEST_TASK_TITLE}`);
}

async function readTask() {
  console.log('\n--- READ TASK ---');

  // Navigate to Tasks and find the created task
  await click(text(sel.app.tasksLink));
  await waitFor(text(TEST_TASK_TITLE), 10000);

  // Click on the task to open detail view
  await click(text(TEST_TASK_TITLE));
  await captureScreenshot('task-detail');

  console.log(`  Opened task detail: ${TEST_TASK_TITLE}`);
}

async function editTask() {
  console.log('\n--- EDIT TASK ---');

  // Click edit button on detail view
  await click(text(sel.tasks.editButton));

  // Clear and update the title field — PLACEHOLDER selector
  await clear($(sel.tasks.titleField));
  await write(TEST_TASK_TITLE + EDITED_SUFFIX, into($(sel.tasks.titleField)));

  // Save
  await click(text(sel.tasks.saveButton));
  await waitFor(text(sel.tasks.successMessage), 10000);
  await captureScreenshot('task-edited');

  console.log(`  Edited task to: ${TEST_TASK_TITLE + EDITED_SUFFIX}`);
}

async function deleteTask() {
  console.log('\n--- DELETE TASK ---');

  // Navigate to the task if not already there
  await click(text(sel.app.tasksLink));
  await waitFor(text(TEST_TASK_TITLE + EDITED_SUFFIX), 10000);
  await click(text(TEST_TASK_TITLE + EDITED_SUFFIX));

  // Click delete button
  await click(text(sel.tasks.deleteButton));

  // Confirm deletion
  await click(text(sel.tasks.confirmDeleteButton));
  await captureScreenshot('task-deleted');

  console.log('  Task deleted.');
}

(async () => {
  await launchBrowser();
  try {
    await login();
    await createTask();
    await readTask();
    await editTask();
    await deleteTask();
    console.log('\nTasks CRUD automation completed successfully.');
  } catch (err) {
    await captureErrorScreenshot('tasks-crud');
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await quitBrowser();
  }
})();
