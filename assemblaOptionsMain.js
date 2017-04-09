angular.module("app",['colorpicker.module','ui.bootstrap'])
	.directive('setFocus', function ($timeout) {
      return function ($scope, $element, $attr) {
          if($attr.setFocus !== false) {
              var timeout = 0;
              var focus = true;
              if ($attr.setFocus) {
                  // if we have focus criteria, then evaluate it against the scope (ex: set-focus="myValue === 1")
                  focus = $scope.$eval($attr.setFocus);
              }

              // if we need to set focus to this element, then wait for the timeout and set focus
              if (focus) {
                  $timeout(function () {
                      $element[0].focus();
											$element[0].select();
                  }, timeout);
              }
          }
      };
  });
