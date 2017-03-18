
var options = {};
var userMentions = [];
var users = {};
var lastConnect;
var showUnread = true;
var showRead = false;

getOptions()

function getOptions() {
		chrome.storage.sync.get({
			secret: '',
			key: '',
			mentionWatchInterval: '60000',
			elapsedTimeInterval: '1000',
			hideEmptyBadge: true,
			autoRead: true,
		}, function(items) {
			options.secret = items.secret;
			options.key = items.key;
			options.mentionWatchInterval = items.mentionWatchInterval;
			options.elapsedTimeInterval = items.elapsedTimeInterval;
			options.hideEmptyBadge = items.hideEmptyBadge;
			options.autoRead = items.autoRead;
			startMentionWatch(options.mentionWatchInterval);
		});
	}

function startMentionWatch(interval) {
	getMentions().always(function(data) {
		options = options || {};
		interval = interval || options.mentionWatchInterval || 60000
		setTimeout(function() {
			getOptions();
		},interval);
	});
}


// Get the user mentions from Assembla, if can connect
function getMentions() {
	var urlUnread = "https://api.assembla.com/v1/user/mentions.json?unread=true"
	var urlRead = "https://api.assembla.com/v1/user/mentions.json?read=true"
	var urlAll = "https://api.assembla.com/v1/user/mentions.json"
	headers = {
		'X-api-key': options ? options.key : null,
		'X-api-secret': options ? options.secret : null
	}
	var configObj = {
		"headers": headers,
		"timeout": 10000
	}

	var url;
	if (showRead && showUnread) {
		url = urlAll;
	} else if (showRead) {
		url = urlRead;
	} else if (showUnread) {
		url = urlUnread;
	} else {
		userMentions = [];
		return {
			always: function(alwaysFunc) {
				alwaysFunc();
			}
		}
	}

	return $.ajax(url,configObj).done(function(data) {
		// Get the time of the last successful connection
		lastConnect = new Date();
		var newUserMentions = [];
		if (!data) data=[];

		// Set the userMentions data
		data.forEach(function(mention) {
			newUserMentions.push(mention);
			var user = users[mention.author_id]
			if (!user || user.name=='not found') {
				getUser(mention.author_id);
			}
		});
		userMentions = newUserMentions;

		// Successful get -- green if there are any mentions, grey or hidden if none
		var badgeText;
		if (userMentions.length>0) {
			badgeText = userMentions.length.toString();
		} else if (options.hideEmptyBadge) {
			badgeText = '';
		} else {
			badgeText = '0'
		}
		chrome.browserAction.setBadgeText({text: badgeText});
		var color = userMentions.length==0 ? '#A8A8A8' : '#00cc00'
		chrome.browserAction.setBadgeBackgroundColor({'color':color});
		return data;
	}).fail(function (err) {
		// If no connection, badge turns red but shows last known userMention length if there have been any successful
		// connections
		chrome.browserAction.setBadgeText({text: !lastConnect || userMentions.length == 0 ? "?!" : userMentions.length.toString()});
		var color =  '#FF0000'
		chrome.browserAction.setBadgeBackgroundColor({'color':color});
	});
}

// Get user info by ID
function getUser(id) {
	var url = "https://api.assembla.com/v1/users/" + id;
	headers = {
		'X-api-key': options.key,
		'X-api-secret': options.secret
	}
	var configObj = {
		"headers": headers
	}
	return $.ajax(url,configObj).done(function(data) {
		users[id] = data;
	}).fail(function(err) {
		console.dir(err);
		users[id]={name:'not found'}
	});
}

// Mark a mention as read
function markMentionRead(id, isSimulation) {

	if (isSimulation) {
		return {
			done: function(doneFunc) {
				setInterval(function() {
					doneFunc();
				},10000);
				return {
					always: function(alwaysFunc) {
						setInterval(function() {
							alwaysFunc();
						},10000);
					}
				}
			}
		}
	}

	var url =  "https://api.assembla.com/v1/user/mentions/" + id +
				"/mark_as_read.json"
	headers = {
		'X-api-key': options.key,
		'X-api-secret': options.secret
	}
	var configObj = {
		"headers": headers,
		"method": "PUT"
	}
	return $.ajax(url,configObj).done(function(data) {
		console.dir(data);
		// successful marking of the mention, get the current state of the mentions
		return getMentions();
	}).fail(function(err) {
		console.dir(err);
	});
}

function cancelInterval() {
	clearInterval(intervalFunc);
}
