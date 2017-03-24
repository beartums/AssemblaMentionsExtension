/**
 * Controller for the extension popup view, which lists mentions and allows interaction
 */
angular.module("app")
	.controller("popupController", ['$window', '$scope', '$timeout', '$sce', popupControllerFunction]);

	function popupControllerFunction($window,$scope,$timeout,$sce) {

		// For controler-as syntax
		var pu = this;

		pu.bgPage = chrome.extension.getBackgroundPage().bg;
		pu.manifest = chrome.runtime.getManifest();
		pu.mentionSources = pu.bgPage.sources;

		pu.gotoUrl = gotoUrl;
		pu.authorInitials = authorInitials;
		pu.markAsRead = markAsRead;
		pu.getElapsedTime = getElapsedTime;
		pu.refresh = refresh;
		pu.toggleMentionType = toggleMentionType;
		pu.openOptions = openOptions;
		pu.toggleApiUpdates = toggleApiUpdates;
		pu.getMentionTypeAbbreviation = getMentionTypeAbbreviation;
		pu.getMentionType = getMentionType;
		pu.getMentionSourceComment = getMentionSourceComment;
		pu.getMentionHtml = getMentionHtml;
		pu.toggleHideFullComment = toggleHideFullComment;
		pu.gotoMention = gotoMention;

		// Watch for changes to the userMentions array so they can be propagated
		$scope.$watch('pu.bgPage.userMentions', function(newVal,oldVal) {
			$timeout(function() {
				let newMentions = [];
				newVal.forEach(function(m) {
					// TODO: retain hide mention state
					newMentions.push(m);
				});
				pu.userMentions = newMentions
			});
		});

		// page shows a counter indicating time since updated.  This starts the clock
		startElapsedTimeInterval();

		/**
		 * Start the clock on the time-since-updated.  This function calls itself recursively
		 * based on the amount of time before changing the counter
		 * @param  {number} interval time (ms) between updates
		 * @return {void}
		 */
		function startElapsedTimeInterval(interval) {
			interval = interval || pu.bgPage.options.elapsedTimeInterval || 1000;
			getElapsedTime();
			$timeout(startElapsedTimeInterval,interval);
		}

		/**
		 * Navigate to the supplied userLogin
		 * @param  {obj} mention mention containing the link to navigate to
		 * @return {void}
		 */
		function gotoMention(mention) {
			if (pu.bgPage.options.autoRead) markAsRead(mention);
			$window.open(mention.link);
		}

		function gotoUrl(url,$event) {
			$event.preventDefault();
			$event.stopPropagation();
			$window.open(url);
		}

		/**
		 * Refresh the mention list -- or ask the backgroundpage to do so
		 * @return {void}
		 */
		function refresh() {
			// start the spinner
			$timeout(function() {
				pu.isRefreshing = true;
				$scope.$apply();
			});
			// nothing to be done with the data, since the controller is watching the
			// background page for changes in the mentions.
			// cancel the spinner and update elapsed time
			pu.bgPage.getMentions().finally(function() {
				$timeout(function() {
					pu.isRefreshing = false;
					pu.getElapsedTime();
				});
			});
		}

		function toggleApiUpdates() {
			if (pu.bgPage.isPaused()) {
				pu.bgPage.startUpdates();
			} else {
				pu.bgPage.pauseUpdates()
			}
		}

		/**
		 * Open the optiong page
		 * @return {void}
		 */
		function openOptions() {
			chrome.runtime.openOptionsPage();
		}

		/**
		 * Mark an unread mention as read -- or ask bg page to do so
		 * @param  {object} mention mention to be marked as Read
		 * @return {void}
		 */
		function markAsRead(mention) {
			let idx = pu.userMentions.indexOf(mention);
			if (idx<0) return;

			var testPattern = "@test@";
			// if this is just a normal deletion taking it's time, don't do anything
			if (mention.message.indexOf(testPattern)==-1 && mention.isBeingDeleted) return

			// if this is a deletion of a test comment, only delete if this is the second click (i.e., click on the spinner)
			var simulateMarking = mention.message.indexOf(testPattern)>-1 && !mention.isBeingDeleted;

			var markRead = "Marking Mention " + mention.id + " Read...";

			mention.isBeingDeleted = true;

			// Call bg page to manipulate the api using jquery.ajax
			pu.bgPage.markMentionRead(mention.id,simulateMarking)
				.then(function(data) {
					$timeout(function() {
						if (pu.userMentions.indexOf(mention)>-1) pu.userMentions.splice(pu.userMentions.indexOf(mention),1);
					});
				}).finally(function () {
					// No matter what, reset the isBeingDeleted flag
					$timeout(function() {
						mention.isBeingDeleted = false;
					});
				});
		}

		/**
		 * Get the initials of the author for displayVal
		 * @param  {string} id Assembla-assigned author_id
		 * @return {string}    author initials, derived from the id as best as possible
		 */
		function authorInitials(id) {
			var author = pu.bgPage.users(id);
			var init = '', inits = []
			if (!author) return '--';

			// use name, with fallback to first part of email or login id
			var name = (author.name ? author.name
									: (author.email ? author.email.substring(0,author.email.indexOf('@')-1)
										: author.login));
			// split by word and take the first letter of each
			inits = name.replace("."," ").split(" ");
			if (inits.length==1) return inits[0].substring(0,3);
			return inits.reduce(function(init,name) {
				init += name[0];
				return init;
			},"");
		}

		/**
		 * Parse time betweed startDate and now, returning human-readable form (I perfer
		 * this to moment.js because of the format and rounding)
		 * @param  {Date} startDate Date from which to calculate
		 * @return {string}           Human-readable fomr of amount of time passed
		 */
		function getElapsedTime(startDate) {
			startDate = startDate || pu.bgPage.lastConnect;
			if (!startDate || !angular.isDate(startDate) || startDate > new Date()) return 'Never';
			// Define the time measure words
			var defs = [
				{uom: 'seconds', divide: 'microseconds', by: 1000},
				{uom: 'minutes', divide: 'seconds', by: 60},
				{uom: 'hours', divide: 'minutes', by: 60},
				{uom: 'days', divide: 'hours', by: 24},
				{uom: 'weeks', divide: 'days', by: 7},
				{uom: 'months', divide: 'days', by: 30.5},
				{uom: 'years', divide: 'days', by: 365},
			];

			// Find the first value less than one and use the previous value (unless it
			// is the first value, then use it anyway).
			var values = { microseconds: new Date() - startDate };
			for (var i = 0; i < defs.length; i++) {
				var def = defs[i]
				var value = values[def.divide]/def.by;
				values[def.uom] = value;
				if (value < 1 && i == 0) return "less than a second";
				if (value < 1) {
					var displayVal = Math.round(values[defs[i-1].uom]);
					return "about " + displayVal + " " + singularizeString(defs[i-1].uom,displayVal) + " ago";
				}
				if (i == defs.length - 1) {
					var displayVal = Math.round(value);
					return "about " + Math.round(value) + " " + singularizeString(def.uom,displayVal) + " ago";
				}
			};

			return "AHHH.  I Don't Know!!"

		}

		function getMentionSourceComment(mention) {
			pu.bgPage.fetchMentionSourceComment(mention)
				.then(function(source) {
					if (source.comment !== mention.message) {
						// $timeout(function() {
						// 	source.show = true;
						// })
					}
				});
		}

		function getMentionHtml(mention) {
			let mentionText = mention.message;
			let source = pu.bgPage.sources[mention.id];
			let startSpan = '<span id="mention" class="bg-success">';
			let endSpan = '</span><!--id="mention"-->';

			if (!source || source.hideFullComment || source.comment == mentionText) {
				return mentionText;
			}

			let message = source.comment;
			message = message.replace(mentionText, startSpan + mentionText + endSpan);
			message = replaceLinks(message,endSpan);
			message = message.replace(/<code>[\n\r]*/,'<code>');

			return $sce.trustAsHtml(message);
		}

		function getMentionTypeAbbreviation(url) {
			let parsed = pu.bgPage.parseUrl(url);
			let words = parsed.type.split(" ");
			let abbreviation = "";
			words.forEach(function(word) {
				abbreviation += word.substr(0,1);
			})
			return abbreviation.toUpperCase();
		}

		function getMentionType(url) {
			let parsed = pu.bgPage.parseUrl(url);
			return parsed.type;
		}

		function replaceLinks(text,endMentionTag) {
			let titleText = 'title="Right-click and select \'Open link in...\' to go to this link; Left-click will take you to the source of this mention in Assembla"';
			// links come in the form: [[...|xxx]] where .. in the link and xxx is the text
			let linkRe = /\[\[([^\]]*)(\]\]|$)/g;
			let replaceRe = /[\[\]]|url:/g
			let matches = text.match(linkRe);
			matches.forEach(function(match) {
				let embeddedTag = match.indexOf(endMentionTag)>-1
				let cleanMatch = match.replace(endMentionTag,'').replace(replaceRe,'');
				let parts = cleanMatch.split('|');
				let link = `<a href="${parts[0]}" ${titleText}>${parts[1]}</a>`;
				if (embeddedTag) link += endMentionTag;
				text=text.replace(match,link);
			})

			return text;

		}


		/**
		 * simple and stupid singularization.  Just remove trailing 's'
		 * @param  {string} str   String to singularizeString
		 * @param  {number} count Number of items (singularize only if 1)
		 * @return {string}       Singlarized viersion of string, if appropriate
		 */
		function singularizeString(str, count) {
			if (count == 1) {
				return str.replace(/s$/,'');
			}
			return str;
		}

		function toggleHideFullComment(mention,source) {
			source = source || pu.bgPage.sources[mention.id];
			source.hideFullComment = !source.hideFullComment;
		}

		/**
		 * Toggle 'Read' and 'Unread' mention viewability on
		 * @param  {string} typeName 'Read' or 'Unread'
		 * @return {void}
		 */
		function toggleMentionType(typeName) {
			pu.bgPage[typeName] = !pu.bgPage[typeName];
			pu.refresh();
		}
	}
