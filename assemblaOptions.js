angular.module("app")
  .controller("assemblaOptionsController", ['assemblaOptionsService',
    function(aos) {

		var vm = this
		vm.status = aos.status;
		vm.options = aos.options;
		vm.change = aos.saveOptions;
		
		aos.setOnReadyHandler(init);

		function init() {
			vm.status = aos.status;
			vm.options = aos.options;
		}
		
		function toggle(obj,prop) {
			obj[prop] = !obj[prop];
			vm.change()
		}

		return vm
    }
  ]);
