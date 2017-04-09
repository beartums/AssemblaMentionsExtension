// Service to manage the assembla options object.  Stored in chrome.sstorage.sync
// so that it syncs across devices
angular.module("app")
  .factory("assemblaOptionsService", ['$rootScope', '$filter', '$timeout', function($rootScope, $filter, $timeout) {

	// Options Object
	var aos = {
    options: {},
		status: {
			msg: '',
			mode: ''
    },
		saveOptions: saveOptions,
		onchange: saveOptions,
		setOnReadyHandler: setOnReadyHandler,
		restoreOptions: restoreOptions
  }

	var readyHandler = null;
	var isReady = false;
	var _delim = "@_@"

	// Read the options from storage
  restoreOptions();

	// initialization complete, return the service;
  return aos;

	// Implementation

	/**
	 * Save the options when a change is mostRecentUpdateDate
	 * @return {void}
	 */
  function onchange() {
    saveOptions();
  }

	/**
	 * Set a function to be called when the service has initialized and completed
	 * loading data from storage
	 * @param {function} handler function to be called when initialization is completed
	 */
	function setOnReadyHandler(handler) {
		readyHandler = handler;
		if (isReady) handler();
	}

	/**
	 * Save the options object to storage
	 * @return {void}
	 */
	function saveOptions() {
    chrome.storage.sync.set({
      secret: aos.options.secret,
      key: aos.options.key,
      statusTimeout: aos.options.statusTimeout,
			mentionWatchInterval: aos.options.mentionWatchInterval,
			elapsedTimeInterval: aos.options.elapsedTimeInterval,
			hideEmptyBadge: aos.options.hideEmptyBadge,
			autoRead: aos.options.autoRead,
			badgeColor: aos.options.badgeColor,
			users: aos.options.users,
			selectedUsers: aos.options.selectedUsers
    }, function() {
        // Update status to let user know options were saved.
        aos.status.msg = 'Options saved.';
        aos.status.style = 'alert-success'
        $rootScope.$apply();
        $timeout(function() {
          aos.status.msg = '';
          aos.status.style = '';
          $rootScope.$apply();
        }, aos.options.statusTimeout);
      });
    }

	/**
	 * Read the saved options from storage and populate the options object
	 * @return {void}
	 */
  function restoreOptions() {
    chrome.storage.sync.get({
      secret: '',
      key: '',
      statusTimeout: 1500,
			mentionWatchInterval: '60000',
			elapsedTimeInterval: '1000',
			badgeColor: '#A8A8A8',
			hideEmptyBadge: true,
			autoRead: true,
			users: [],
    }, function(items) {
			$timeout(function() {
				aos.options.secret = items.secret;
				aos.options.key = items.key;
				aos.options.statusTimeout = items.statusTiemout;
				aos.options.mentionWatchInterval = items.mentionWatchInterval;
				aos.options.elapsedTimeInterval = items.elapsedTimeInterval;
				aos.options.badgeColor = items.badgeColor;
				aos.options.hideEmptyBadge = items.hideEmptyBadge;
				aos.options.autoRead = items.autoRead;
				aos.options.users = items.users;
				aos.options.isReady = true;
				if (readyHandler && !isReady) readyHandler();
				isReady = true;
//	      $rootScope.$apply();
			});
    });
  }
}]);
