angular.module("app", ['ngSanitize','SelectByLabelModule','ui.bootstrap'])
		// Needed since stoppropagation was causing a page reload
	.directive('preventDefault', function() {
			return function(scope, element, attrs) {
					angular.element(element).bind('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
					});
			}
	})
	.config (['$compileProvider', function($compileProvider) {
		 $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
	}])
