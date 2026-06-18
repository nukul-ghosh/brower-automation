'use strict';

const { goto, click, write, into, waitFor, text, $, clear, textBox } = require('taiko');
const { launchBrowser, quitBrowser, captureScreenshot, captureErrorScreenshot } = require('../../helpers/browser');
const { login } = require('../../helpers/auth');
const config = require('../../helpers/env');
const sel = require('../../helpers/selectors');

const TEST_SUBMISSION_NAME = `Test Submission ${Date.now()}`;
const EDITED_SUFFIX = ' (edited)';

async function createSubmission() {
  console.log('\n--- CREATE SUBMISSION ---');

  // Navigate to Submissions section
  await click(text(sel.app.submissionsLink));
  await waitFor(text(sel.submissions.createButton), 10000);

  // Click create button
  await click(text(sel.submissions.createButton));
  await captureScreenshot('submission-create-form');

  // Fill in submission name — PLACEHOLDER selector, update after screenshots
  await write(TEST_SUBMISSION_NAME, into($(sel.submissions.nameField)));

  // Save
  await click(text(sel.submissions.saveButton));
  await waitFor(text(sel.submissions.successMessage), 10000);
  await captureScreenshot('submission-created');

  console.log(`  Created submission: ${TEST_SUBMISSION_NAME}`);
}

async function readSubmission() {
  console.log('\n--- READ SUBMISSION ---');

  // Search or find the created submission in the list
  await click(text(sel.app.submissionsLink));
  await waitFor(text(TEST_SUBMISSION_NAME), 10000);

  // Click on the submission to open detail view
  await click(text(TEST_SUBMISSION_NAME));
  await captureScreenshot('submission-detail');

  console.log(`  Opened submission detail: ${TEST_SUBMISSION_NAME}`);
}

async function editSubmission() {
  console.log('\n--- EDIT SUBMISSION ---');

  // Click edit button on detail view
  await click(text(sel.submissions.editButton));

  // Clear and update the name field — PLACEHOLDER selector
  await clear($(sel.submissions.nameField));
  await write(TEST_SUBMISSION_NAME + EDITED_SUFFIX, into($(sel.submissions.nameField)));

  // Save
  await click(text(sel.submissions.saveButton));
  await waitFor(text(sel.submissions.successMessage), 10000);
  await captureScreenshot('submission-edited');

  console.log(`  Edited submission to: ${TEST_SUBMISSION_NAME + EDITED_SUFFIX}`);
}

async function deleteSubmission() {
  console.log('\n--- DELETE SUBMISSION ---');

  // Navigate to the submission if not already there
  await click(text(sel.app.submissionsLink));
  await waitFor(text(TEST_SUBMISSION_NAME + EDITED_SUFFIX), 10000);
  await click(text(TEST_SUBMISSION_NAME + EDITED_SUFFIX));

  // Click delete button
  await click(text(sel.submissions.deleteButton));

  // Confirm deletion
  await click(text(sel.submissions.confirmDeleteButton));
  await captureScreenshot('submission-deleted');

  console.log('  Submission deleted.');
}

(async () => {
  await launchBrowser();
  try {
    await login();
    await createSubmission();
    await readSubmission();
    await editSubmission();
    await deleteSubmission();
    console.log('\nSubmissions CRUD automation completed successfully.');
  } catch (err) {
    await captureErrorScreenshot('submissions-crud');
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await quitBrowser();
  }
})();
