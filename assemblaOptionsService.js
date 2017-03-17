angular.module("app")
  .factory("assemblaOptionsService", ['$rootScope', '$filter', function($rootScope, $filter) {

    var aos = {
      options: {},
		data: {
			tickets: [],
			lastCompletedUpdateDate: '2006-01-01',
			mostRecentUpdateDate: null
		},
		status: {
			msg: '',
			mode: ''
      },
		saveOptions: saveOptions,
		onchange: saveOptions,
		setOnReadyHandler: setOnReadyHandler
    }

	var readyHandler = null;
	var isReady = false;
	
	var _delim = "@_@"

    restoreOptions();

    return aos;
		
    function onchange() {
      saveOptions();
    }
		
	function setOnReadyHandler(handler) {
		readyHandler = handler;
		if (isReady) handler();
	}

    
	function saveOptions() {
      chrome.storage.sync.set({
        itemsPerPage: aos.options.itemsPerPage,
        currentPage: aos.options.currentPage,
        currentMilestone: aos.options.currentMilestone,
        currentSortAscending: aos.options.currentSortAscending,
        currentSortColumn: aos.options.currentSortColumn,
        secret: aos.options.secret,
        key: aos.options.key,
        statusTimeout: aos.options.statusTimeout,
		userLogin: aos.options.userLogin,
		purgeBeforeDate: $filter('date')(aos.options.purgeBeforeDate,'yyyy-MM-dd'),
		loadAllTickets: aos.options.loadAllTickets,
		purgeOpenTickets: aos.options.purgeOpenTickets,
		mentionWatchInterval: aos.options.mentionWatchInterval,
		elapsedTimeInterval: aos.options.elapsedTimeInterval,
		filters: aos.options.filters,
		filters: aos.options.hiddenColumns
      }, function() {
        // Update status to let user know options were saved.
        aos.status.msg = 'Options saved.';
        aos.status.style = 'alert-success'
        $rootScope.$apply();
        setTimeout(function() {
          aos.status.msg = '';
          aos.status.style = '';
          $rootScope.$apply();
        }, aos.options.statusTimeout);
      });
    }

    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    function restoreOptions() {
      // Use default value color = 'red' and likesColor = true.
      chrome.storage.sync.get({
        secret: '',
        key: '',
        statusTimeout: 1500,
        itemsPerPage: 10,
        currentPage: 1,
        currentMilestone: null,
        currentSortAscending: true,
        currentSortColumn: null,
		visibleColumnNameString: '',
		userLogin: 'eric.griffith',
		purgeOpenTickets: false,
		purgeBeforeDate: '2012-01-01',
		loadAllTickets: false,
		mentionWatchInterval: '600000',
		elapsedTimeInterval: '1000',
		filters: {},
		hiddenColumns: {}
      }, function(items) {
        aos.options.itemsPerPage = items.itemsPerPage;
        aos.options.currentPage = items.currentPage;
        aos.options.currentMilestone = items.currentMilestone;
        aos.options.currentSortAscending = items.currentSortAscending;
        aos.options.currentSortColumn = items.currentSortColumn;
        aos.options.secret = items.secret;
        aos.options.key = items.key;
        aos.options.statusTimeout = items.statusTimeout;
		aos.options.visibleColumnNameString = items.visibleColumnNameString;
		aos.options.userLogin = items.userLogin;
		aos.options.mentionWatchInterval = items.mentionWatchInterval;
        aos.options.elapsedTimeInterval = items.elapsedTimeInterval;
        aos.options.purgeBeforeDate = items.purgeBeforeDate;
        aos.options.loadAllTickets = items.loadAllTickets;
        aos.options.purgeOpenTickets = items.purgeOpenTickets;
		aos.options.filters = items.filters;
		aos.options.hiddenColumns = items.hiddenColumns;
        $rootScope.$apply();
		if (readyHandler && !isReady) readyHandler();
		isReady = true;
      });
    }


  }]);
