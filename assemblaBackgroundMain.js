angular.module("app", [])
	.filter("authorInitials", function() {
		return function(user) {
			var author = user;
			var init = '', inits = []
			if (!author) return '--';
			var name = authorName(author);
			inits = name.replace("."," ").split(" ");
			if (inits.length==1) return inits[0].substring(0,3);
			return inits.reduce(function(init,name) {
				init += name[0];
				return init;
			},"");
		}
	})
	.filter("authorName", function() {
		return function(user) {
			return authorName(user);
		}
	});

	function authorName(author) {
		if (!author) return '--';
		var name = (author.name ? author.name
								: (author.email ? author.email
									: author.login));
		return name;
	}
