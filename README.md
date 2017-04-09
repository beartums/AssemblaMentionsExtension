# AssemblaMentions
Chrome extension for managing Assembla Mentions

Coming Attractions (someday):
 - Mention Filtering: User/date Range/text
 - Get more detail about source (ticket title and description, merge description)
 - Further improvements in user lookup calls
 - get merge description mentions (big)
 - display error messages

Change Log:

1.2.0
 - Filter mentions to display by user (click on 'By' in table heading on popup)
 - Edit mention author initials (options page | Commenters | click on initials)
 - Fixed bug causing api calls to fail when extension is first loaded

1.1.2
 - Sanitize input from mentions so malicious code isn't included
 - Better indication that the mention type is clickable
 - Configurable Badge Color, in options

1.1.1
 - Bug when no links are found in text

1.1.0
 - some basic formatting using Assembla's unique formatting rules
 - Retrieve the full text of a comment from the source object when clicking on the source-type label to the right of the date
 - replace partial text with full text if retrieved, with highlighting of partial text

1.0.20
 - Retrieve popup icon image path from manifest rather than hard code
 - Add Icons and manifest for generalized version (rename manifest_generic.json to manifest.json)
 - Add label indicating mention source (TD, TC, MC)

1.0.19
 - Fix bug not updating options in background controller

1.0.10-18
 - Changes to try to fix the 'this extension ay be corrupted' error in chrome

1.0.9
 - Fiddling with popup page styling (handling extension weirdness)
 - Better options handling (watch for changes and restart mention-watch loop immediately, if appropriate)
 - Fix bugs introduced by extensionizing?

1.0.8
 - Fully AngularJs (including the background page)
 - Fewer unnecessary API calls
 - More internal documentation

1.0.7
 - Elapsed Time counter auto-update
 - Elapsed time counter variable update rate
 - Toggle Auto-read of mentions when navigating to that mentions
 - Toggle Whether or not a badge is displayed on extension icon when no mentions are found
 - internal documentation
 - display version on options and popup pages

1.0.6
 - Interface cleanup
 - Read unread and/or read mentions (only unread by default)
