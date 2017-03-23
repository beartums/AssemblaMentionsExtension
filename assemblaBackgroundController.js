angular.module("app", []);

angular.module("app")
	.controller("assemblaBackgroundController", ['$window', '$scope', '$timeout', '$q', 'assemblaApiService', 'assemblaOptionsService',  assemblaBackgroundControllerFunction]);

	function assemblaBackgroundControllerFunction($window, $scope, $timeout, $q, aas, aos) {

		// For controler-as syntax
		// NOTE: not using 'var' because I WANT this to be a global object attached to
		// the window.  This allows the other parts of this extension to watch the
		// data and manipulate this controller
		bg = this;

		// INTERFACE
		bg.options = aos.options;
		bg.aos = aos;
		bg.userMentions = [];
		bg.sources = {};
		bg.users = {};
		bg.lastConnect;
		bg.usersBeingFetched = [];

		// Control behavior for this instance only.
		bg.showUnread = true; // show unread messages
		bg.showRead = false;  // show read messages
		//bg.updatesPaused = false;  // Pause api polling
		var _updatesPaused = false;
		var _mentionsPromise;

		bg.getMentions = getMentions;
		bg.markMentionRead = markMentionRead;
		bg.getUser = getUser;
		bg.pauseUpdates = pauseUpdates;
		bg.startUpdates = startUpdates;
		bg.isPaused = isPaused;
		bg.parseUrl = parseUrl;
		bg.fetchMentionSourceComment = fetchMentionSourceComment;

		// load the options from storage
		aos.setOnReadyHandler(init);

		// Watch for changes in the the synced storage
		chrome.storage.onChanged.addListener(function(changes, area) {
			if (area !== 'sync') return;
			// If the secret or key have changed, reinitialize the Api Service
			if (changes.secret || changes.key) {
				let secret = changes.secret ? changes.secret.newValue : bg.options.secret;
				let key = changes.key ? changes.key.newValue : bg.options.key;
				aas.init({key: key, secret: secret});
			}
			// Propagate the changes to the internal options object
			for (let prop in changes) {
				if (changes.hasOwnProperty(prop)) {
					bg.options[prop] = changes[prop].newValue;
				}
			}
			// if the changes affect the mention watch in any way, restart the loop
			//if (changes.secret || changes.key || changes.mentionWatchInterval || cha) {
				if (!_updatesPaused)  {
					$timeout.cancel(_mentionsPromise);
					startMentionWatch();
				}
			//}
		});

		return bg;

		function init() {
			aas.init({key: bg.options.key, secret: bg.options.secret});
			startMentionWatch();
		}

		/**
		 * Begin watching for changes in the mentions on assembla.  This function calls
		 * itself with timeout after every read -- allows interval to change easily
		 * @param  {number} interval time (ms) until the next check
		 * @return {void}
		 */
		function startMentionWatch(interval) {

			getMentions().finally(function(data) {
				// set the key and secret for the api service
				interval = interval || bg.options.mentionWatchInterval || 60000;
				_mentionsPromise = $timeout(function() {
					startMentionWatch();
				},interval);
			});
		}

		function pauseUpdates() {
			_updatesPaused = true;
			let cancelled = $timeout.cancel(_mentionsPromise);
		}

		function startUpdates() {
			_updatesPaused = false;
			startMentionWatch();
		}

		function isPaused() {
			return _updatesPaused;
		}

		function fetchMentionSourceComment(mention) {
			var parsedUrl = aas.parseUrl(mention.link)
			return aas.fetchSourceCommentText(parsedUrl,mention.message)
				.then(function(source) {
					$timeout(function() {
						// Put source in a reference object so that when mentions are updated, the
						// reference is still there
						bg.sources[mention.id] = source;
						// also return the source, in case the caller wants to do something
						// with it
					});
					return source;
				});
		}

		function cleanupSources(mentions, sources) {
			let mentionsObj = {};
			for (let i = 0; i < mentions.length; i++) {
				mentionsObj[mentions[i].id] = mentions[i];
			}
			for (let prop in sources) {
				if (!mentionsObj[prop]) delete sources[prop];
			}
		}

		/**
		 * Get the mentions from assembla if can connect.
		 * @return {$q.promise} resolves to raw data from assembla
		 */
		function getMentions() {

			var qObj = {
				doNotPage: true,
				parms: {
				}
			}

			// showRead and showUnread are managed on the popup.  they determine which
			// types of mentions to show.  Usually unread are preferred
			if (bg.showRead && !bg.showUnread) {
				qObj.parms.read = true;
			} else if (bg.showUnread && !bg.showRead) {
				qObj.parms.unread = true;
			} else if (!bg.showRead && !bg.showUnread) {
				// If neither are selected, then return an empty array and the alwaysFunction
				bg.userMentions = [];
				return $q.when(bg.userMentions);
			}

			return aas.getUserMentions(qObj)
				.then(function(results) {
					// Get the time of the last successful connection
					bg.lastConnect = new Date();
					var newUserMentions = [];
					var data = results && results.data ? results.data : [];

					// Set the userMentions data
					data.forEach(function(mention) {
						newUserMentions.push(mention);
						// if the user info for the sende of this mention is not available, get it
						var user = bg.users[mention.author_id]
						if (!user || user.name=='not found') {
							getUser(mention.author_id);
						}
					});
					bg.userMentions = newUserMentions;
					cleanupSources(bg.userMentions, bg.sources);

					// Successful get -- green if there are any mentions, grey or hidden if none
					// hideEmptyBadge is global setting to turn off the badge if the count is 0
					var badgeText;
					if (bg.userMentions.length>0) {
						badgeText = bg.userMentions.length.toString();
					} else if (bg.options.hideEmptyBadge) {
						badgeText = '';
					} else {
						badgeText = '0'
					}
					// Set the badge
					chrome.browserAction.setBadgeText({text: badgeText});
					var color = bg.userMentions.length==0 ? '#A8A8A8' : '#00cc00'
					chrome.browserAction.setBadgeBackgroundColor({'color':color});
					return data;
				}).catch(function (err) {
					// If no connection, badge turns red but shows last known userMention length
					//  if there have been any successful
					// connections
					chrome.browserAction.setBadgeText({text: !bg.lastConnect  ? "?!" : bg.userMentions.length.toString()});
					var color =  '#FF0000'
					chrome.browserAction.setBadgeBackgroundColor({'color':color});
				});
		}

		/**
		 * Ping Assembla API to ge tthe user info
		 * @param  {string} id User Id from mentions
		 * @return {$q.promise}    resolves to user object, if any
		 */
		function getUser(id) {
			if (bg.usersBeingFetched.indexOf(id)>-1) return;
			bg.usersBeingFetched.push(id);

			return aas.getUser({userId: id}).then(function(results) {
				bg.users[id] = results && results.data ? results.data : {};
			}).catch(function(err) {
				console.dir(err);
				bg.users[id]={name:'not found'}
			}).finally(function() {
				if (bg.usersBeingFetched.indexOf(id)==-1) return;
				bg.usersBeingFetched.splice(bg.usersBeingFetched.indexOf(id),1);
			});
		}

		/**
		 * Mark a specified mention as read on assembla
		 * NOTE: this can be updated to use the assemble api service
		 * @param  {string}  id           mention Id to mark read
		 * @param  {Boolean} isSimulation Should this only simulate a deletion?
		 * @return {$.Ajax.promise}               object with done: and error: functions
		 */
		function markMentionRead(id, isSimulation) {

			// if this is a simulation, wait ten seconds and treat it as done
			// but don't call the api
			if (isSimulation) {
				return $q.when('')
					.then(function() {
						return $timeout(function(){},10000);
					});
			}

			return aas.markMentionAsRead({mentionId: id}).then(function(data) {
				//console.dir(data);
				// successful marking of the mention, get the current state of the mentions
				return getMentions();
			}).catch(function(err) {
				//console.dir(err);
			});
		}

		function parseUrl(url) {
			return aas.parseUrl(url);
		}
}
