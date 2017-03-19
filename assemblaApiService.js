angular.module("app")
  .factory("assemblaApiService", ['$http', '$rootScope', function($http, $rootScope) {

    var reqObj = {
			method: "GET",
			headers: {
				"X-Api-Key": null,
				"X-Api-Secret": null
			},
			url: ""
		}

    var asf = {
      getSpaces: getSpaces,
      getTickets: getTickets,
      getMilestones: getMilestones,
			getUsers: getUsers,
			getComments: getComments,
			getUser: getUser,
			getTags: getTags,
			getStatuses: getStatuses,
			getRoles: getRoles,
			getCustomFields: getCustomFields,
			getTicket: getTicket,
			getTicketComment: getTicketComment,
			getActivity: getActivity,
			updateTicket: updateTicket,
			saveComment: saveComment,
			markMentionAsRead: markMentionAsRead,
			getUpdatedTickets: getUpdatedTickets,
			getUserMentions: getUserMentions,
			findFirstUpdatedSince: findFirstUpdatedSince,
      init: init
    };

    return asf;

    var self = this;

    function init(authObj) {
      reqObj.headers["X-Api-Key"] = authObj.key;
      reqObj.headers["X-Api-Secret"] = authObj.secret;
    }

		function getUsers(qObj) {
		  var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
        "/users.json";
			if (qObj.parms) url += makeUrlParms(qObj.parms);
      return $http.get(url,reqObj);
		}

		function getUser(qObj) {
		  var url = "https://api.assembla.com/v1/users/" + qObj.userId + ".json";
			if (qObj.parms) url += makeUrlParms(qObj.parms);
      return $http.get(url,reqObj);
		}

		function getTags(qObj) {
		  var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
        "/tags/active.json";
			if (qObj.parms) url += makeUrlParms(qObj.parms);
      return $http.get(url,reqObj);
		}

		function getRoles(qObj) {
		  var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
        "/user_roles.json";
			if (qObj.parms) url += makeUrlParms(qObj.parms);
      return $http.get(url,reqObj);
		}

		function getCustomFields(qObj) {
		  var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
        "/tickets/custom_fields.json";
			if (qObj.parms) url += makeUrlParms(qObj.parms);
      return $http.get(url,reqObj);
		}

    function getTickets(qObj) {
      var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
        "/tickets/milestone/" + qObj.milestoneId + ".json";

      return getData(url,qObj);
    }

    function getUpdatedTickets(qObj) {
      var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
        "/tickets.json";
      return getData(url,qObj);

    }

		function updateTicket(qObj) {
			var url = "https://api.assembla.com/spaces/" + qObj.spaceId +
				"/tickets/" + qObj.ticketNumber;
			var hObj = angular.copy(reqObj.headers);
			hObj["Content-type"]="application/json";
			return $http.put(url,{ticket:qObj.data},hObj);
		}

		function markMentionAsRead(qObj) {
			var url = "https://api.assembla.com/v1/user/mentions/" + qObj.mentionId +
				"/mark_as_read.json";

			var config = {
				headers: reqObj.headers,
				url: url,
				method: "PUT"
			}

			return $http(config);
			
			return $http.put(url,null,reqObj.headers);
		}

		function getData(url, qObj, callingProcedure) {
			if (!qObj.parms) qObj.parms = {};
			if (!qObj.parms.per_page) qObj.parms.per_page = 100;
			if (!qObj.parms.page) qObj.parms.page = 1;
			var gdUrl = url;
			if (gdUrl.indexOf('?') > -1) gdUrl = gdUrl.substring(0,gdUrl.indexOf('?'))

			gdUrl += makeUrlParms(qObj.parms)

			var p = $http.get(gdUrl,reqObj);

			if (qObj.doNotPage) return p;
			return p.then(function(results) {
				var data = angular.isArray(results)?results:results.data;
				if (!qObj.returnedData) qObj.returnedData=[];
				if (angular.isArray(data)) {
					data.forEach(function(item) {qObj.returnedData.push(item); });
				}

				if (qObj.dataHandler) {
					if (qObj.dataHandler(data)) return qObj.returnedData;
				} else if (qObj.dataObject) {
					data.forEach(function(item) {qObj.dataObject.push(item); });
				}

				if (data.length < qObj.parms.per_page) return qObj.returnedData;
				qObj.parms.page++;
				return getData(url,qObj);
			});
		}

		function getTicket(qObj) {
			var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
        "/tickets/";
			url += qObj.ticketId ? ("id/" + qObj.ticketId) : qObj.ticketNumber;
			url += ".json";

			if (qObj.parms) url += makeUrlParms(qObj.parms);

			return $http.get(url,reqObj);
		}

		function getActivity(qObj) {
			var url = "https://api.assembla.com/v1/activity.json"

			return getData(url,qObj);
		}

    function getSpaces() {
      var url = "https://api.assembla.com/v1/spaces.json"
      return $http.get(url,reqObj)
    }

		function getUserMentions(qObj) {
      var url = "https://api.assembla.com/v1/user/mentions.json"
      return getData(url,qObj)
    }

	// type can be 'all', 'completed', or null
    function getMilestones(qObj) {
      var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
          "/milestones" + (qObj.type ? "/" + qObj.type : "") + ".json";
			if (qObj.parms) url += makeUrlParms(qObj.parms);
      return $http.get(url,reqObj);
    }

		function getTicketComment(qObj) {
			var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
          "/tickets/" + qObj.ticketNumber + "/ticket_comments/" + qObj.commentId + ".json";
      return getData(url,qObj);
		}

		function getComments(qObj) {
			var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
          "/tickets/" + qObj.ticketNumber + "/ticket_comments.json";
      return getData(url,qObj);
		}

		function saveComment(qObj) {
			var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
				"/tickets/" + qObj.ticketNumber + "/ticket_comments.json";
			var hObj = angular.copy(reqObj.headers);
			hObj["Content-type"]="application/json";
			return $http.post(url,{ticket_comment:qObj.data},{headers:hObj});
		}

    function getStatuses(qObj) {
      var url = "https://api.assembla.com/v1/spaces/" + qObj.spaceId +
          "/tickets/statuses.json";
			if (qObj.parms) url += makeUrlParms(qObj.parms);
      return $http.get(url,reqObj);
    }

		function findFirstUpdatedSince(spaceId,date,lastInterval,lastRowRead,lastTicket) {
			var url = "https://api.assempla.com/spaces/" + spaceId + "/tickets.json";
			url += "?report=0&sort_by=updated_at&sort_order=asc&per_page=1";
			lastRowRead = lastRowRead || 1;
			if (Math.abs(lastInterval)==1) return lastRowRead;
			if (!date) return 1;
			var nextRow = 0;
			var nextInterval = Math.abs(Math.ceil(lastInterval/2));
			if ((!lastTicket && lastRowRead && lastowRead>0) || (lastTicket && new Date(lastTicket.updated_at) > date)) {
					nextInterval = -nextInterval;
			}
			nextRow = lastRow + nextInterval;
			url += "&page=" + nextRow;
			return http.get(url,reqObj).success(function(data) {
				var ticket=data;
				return findFirstUpdatedSince(spaceId,data,nextInterval,nextRow,ticket);
			}).error(function(error) {
				return findFirstUpdatedSince(spaceId,data,nextInterval,nextRow);
			})
		}

		function makeUrlParms(parmObj) {
			var parms = [];
			for (var prop in parmObj) {
				parms.push(prop + "=" + parmObj[prop]);
			}
      if (parms.length > 0) return "?" + parms.join("&");
			return "";
		}
  }]);
