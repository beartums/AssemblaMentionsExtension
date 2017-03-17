angular.module("assemblaPopup", [])
	.filter("authorInitials", function() {
		return function(id,users) {
			var author = users[id];
			var init = '', inits = []
			if (!author) return '--';
			var name = (author.name ? author.name 
									: (author.email ? author.email.substring(0,author.email.indexOf('@')-1)
										: author.login));
			inits = name.replace("."," ").split(" ");
			if (inits.length==1) return inits[0].substring(0,3);
			return inits.reduce(function(init,name) {
				init += name[0];
				return init;
			},"");
		}
	})
	.filter("authorName", function() {
		return function(id,users) {
			var author = users[id];
			if (!author) return '--';
			var name = (author.name ? author.name 
									: (author.email ? author.email
										: author.login));
			return name;
		}
	})
		// Needed since stoppropagation was causing a page reload
	.directive('preventDefault', function() {
			return function(scope, element, attrs) {
					angular.element(element).bind('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
					});
			}
	})


