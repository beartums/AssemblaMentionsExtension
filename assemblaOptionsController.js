// Controller for the assembla mentions options page
angular.module("app")
  .controller("assemblaOptionsController", ['assemblaOptionsService', '$scope',
    function(aos, $scope) {

			// for controller-as syntax
			var vm = this
			vm.manifest = chrome.runtime.getManifest()
			vm.status = aos.status;
			vm.options = aos.options;
			// when a change is made, save the options to chrome storage
			vm.change = aos.saveOptions;
			vm.getColorStyle = getColorStyle;
			

			// have the Options Service call the init function when data has been loaded
			aos.setOnReadyHandler(init);

			$scope.$watch('vm.options.badgeColor',function(newVal,oldVal) {
				console.log(newVal,oldVal);
				if (typeof oldVal == 'undefined') return;
				if (newVal!=oldVal) vm.change();
			});

			// Set the display objects
			function init() {
				vm.status = aos.status;
				vm.options = aos.options;
			}

			// Not used
			function toggle(obj,prop) {
				obj[prop] = !obj[prop];
				vm.change()
			}
			
			function getColorStyle(color) {
				let style = {
					'background-color': color,
					color: color
				}
				return style;
			}

			return vm
    }
  ]);
