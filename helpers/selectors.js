'use strict';

/**
 * Centralised DOM selectors for the Maps/BLU app.
 *
 * All selectors marked PLACEHOLDER need to be updated from actual app screenshots.
 * Update them here — all scripts import from this single file.
 */

const selectors = {
  // Okta SSO login page
  okta: {
    usernameField: '[name="identifier"]',              // PLACEHOLDER — Okta username/email input
    passwordField: '[name="credentials.passcode"]',    // PLACEHOLDER — Okta password input
    nextButton: '[data-type="save"]',                  // PLACEHOLDER — Okta "Next" button
    signInButton: '[data-type="save"]',                // PLACEHOLDER — Okta "Sign In" / "Verify" button
    mfaPrompt: '[data-se="o-form-head"]',              // PLACEHOLDER — MFA challenge heading
    mfaPushSent: 'Push notification sent',             // PLACEHOLDER — text visible after push sent
  },

  // Main app navigation
  app: {
    landingIndicator: 'Submissions',                   // PLACEHOLDER — text visible on landing page after login
    sideNav: '[data-testid="sidebar"]',                // PLACEHOLDER — sidebar navigation container
    submissionsLink: 'Submissions',                    // PLACEHOLDER — sidebar link text
    tasksLink: 'Tasks',                                // PLACEHOLDER — sidebar link text
    projectsLink: 'Projects',                          // PLACEHOLDER — sidebar link text
    contactsLink: 'Contacts',                          // PLACEHOLDER — sidebar link text
    assetsLink: 'Assets',                              // PLACEHOLDER — sidebar link text
    commentsLink: 'Comments',                          // PLACEHOLDER — sidebar link text
    notesLink: 'Notes',                                // PLACEHOLDER — sidebar link text
    timeLogLink: 'Time Log',                           // PLACEHOLDER — sidebar link text
    activityLogLink: 'Activity Log',                   // PLACEHOLDER — sidebar link text
    searchInput: '[placeholder="Search"]',             // PLACEHOLDER — global search input
  },

  // Submissions page
  submissions: {
    createButton: 'New Submission',                    // PLACEHOLDER — button text to create new submission
    nameField: '[label="Name"]',                       // PLACEHOLDER — submission name input
    typeField: '[label="Type"]',                       // PLACEHOLDER — submission type dropdown/input
    statusField: '[label="Status"]',                   // PLACEHOLDER — submission status dropdown
    saveButton: 'Save',                                // PLACEHOLDER — save button text
    editButton: 'Edit',                                // PLACEHOLDER — edit button text
    deleteButton: 'Delete',                            // PLACEHOLDER — delete button text
    confirmDeleteButton: 'Confirm',                    // PLACEHOLDER — delete confirmation button text
    tableRow: '.submission-row',                       // PLACEHOLDER — CSS selector for submission rows in list
    successMessage: 'successfully',                    // PLACEHOLDER — text in success toast/message
  },

  // TM1 SSO login flow
  tm1: {
    // Screen 1: TM1 "Select Market"
    selectMarketHeading: 'Select Market',
    nextButton: 'Next',                              // shared "Next" button text across TM1 screens

    // Screen 2: TM1 "Sign in to your account"
    tm1UsernameField: 'input',                       // PLACEHOLDER — inspect TM1 login page for exact selector

    // Screen 3: Okta "Sign In" (after TM1 redirects to Okta)
    oktaUsernameField: '[name="identifier"]',        // Okta standard username/email input
    oktaNextButton: '[data-type="save"]',            // Okta "Next" button

    // Screen 4: Okta "Verify with your password"
    oktaPasswordField: '[name="credentials.passcode"]', // Okta password input
    oktaVerifyButton: '[data-type="save"]',          // Okta "Verify" button

    // Screen 5: Okta MFA method selection
    mfaSelectionHeading: 'you with a security method',
    mfaPushOption: 'Get a push notification',        // label text for the push notification row
    mfaPushSelectButton: '[data-se="okta_verify-push"] a[data-se="button"]', // "Select" link inside the push notification row

    // Screen 6: Okta push notification sent
    mfaPushSent: 'Push notification sent',           // text visible after push is dispatched

    // Post-login TM1 landing page
    landingIndicator: 'Events',                      // PLACEHOLDER — update to text visible on TM1 home after login
  },

  // Tasks page
  tasks: {
    createButton: 'New Task',                          // PLACEHOLDER — button text to create new task
    titleField: '[label="Title"]',                     // PLACEHOLDER — task title input
    assigneeField: '[label="Assignee"]',               // PLACEHOLDER — task assignee dropdown/input
    dueDateField: '[label="Due Date"]',                // PLACEHOLDER — task due date input
    statusField: '[label="Status"]',                   // PLACEHOLDER — task status dropdown
    saveButton: 'Save',                                // PLACEHOLDER — save button text
    editButton: 'Edit',                                // PLACEHOLDER — edit button text
    deleteButton: 'Delete',                            // PLACEHOLDER — delete button text
    confirmDeleteButton: 'Confirm',                    // PLACEHOLDER — delete confirmation button text
    tableRow: '.task-row',                             // PLACEHOLDER — CSS selector for task rows in list
    successMessage: 'successfully',                    // PLACEHOLDER — text in success toast/message
  },
};

module.exports = selectors;
