// Controller for the assembla mentions options page
angular.module("app")
  .controller("assemblaOptionsController", ['assemblaOptionsService',
    function(aos) {

			// for controller-as syntax
			var vm = this
			vm.manifest = chrome.runtime.getManifest()
			vm.status = aos.status;
			vm.options = aos.options;
			// when a change is made, save the options to chrome storage
			vm.change = aos.saveOptions;

			// have the Options Service call the init function when data has been loaded
			aos.setOnReadyHandler(init);

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

			return vm
    }
  ]);
