angular.module("app", ['ui.bootstrap'])

	//	Directive to prevent clicks from propagating updward in tables and
	// divs
	.directive('preventDefault', function() {
			return function(scope, element, attrs) {
					angular.element(element).bind('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
					});
			}
	})
