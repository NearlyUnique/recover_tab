# Overview

A Chrome extension to remember the last "useful" url for a tab. Especially handy when your enterprise SSO solution forces a restart
of your browser and the SSO solution loses the tab history so even after authenticating, you and it fails for non user/password reasons you stand a chance of recovering what the tab was.

# Installation

This won't have been published to the Extension Store so it has to be side loaded.

1. In Chrome go to `chrome://extensions/`
2. Enable "Developer Mode" (top right)
3. Click "Loadd unpacked" (top left)
4. Select the folder where you unzipped these files

## To update

1. In Chrome go to `chrome://extensions/`
2. Find the "Recover Tab" extension
3. Click the update button `⟳`

# Strucutre

- `recover.js` - the meat of the code
- `main.*` - the page shown when you click the extension icon
- `options.*` - available via context menu on the extension
- `recover.tests.js` - tests the main `refresh()` funciton
- `background.js` - generates the link from the extensions page to get a console to then view the stored `state`
- `simple_test.js` - a stand along poor mans unit test runner I had kicking around. It does the job

# Notes

- No js can apear in the html file.
- No browser specif bits can appear in recover.js otherwise the tests can't run
- I am not 100% confident that window id stays consistant after a system restart, however the tab index does so should switch to that instead
- There are events that can be used to keep better track of the tabs
