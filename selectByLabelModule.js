angular.module("SelectByLabelModule", [])

	.directive('selectByLabel', ['$timeout', function($timeout) {

		var _TEMPLATE = `
			<span ng-repeat="obj in sbl.config.options track by $index">
				<a
					class="label label-clickable" href="#"
					ng-class="{'label-success': sbl.isSelected(obj), 'label-default': !sbl.isSelected(obj), 'disabled': sbl.isDisabled(obj)}"
					ng-click="sbl.toggleSelection(obj,sbl.isDisabled(obj));"
					ng-attr-title="{{sbl.config.title ? obj[sbl.config.title] : ''}}">
						{{sbl.getDisplayValue(obj)}}
				</a> &nbsp;
			</span>`

		return {
			restrict: "AE",
			template: _TEMPLATE,
			controllerAs: 'sbl',
			bindToController: true,
			scope: {
				options: "=",							// Array of options or object, each option a property
				disabledOptions: "=?",		// array of disabled options
				selectedOptions: "=?",		// Array of selected options, OR
				displayProperty: "@?", 		// item property used for display value
				sortProperty: "@?",				// Sort labels based on this property value
				titleProperty: "@?",			// Display this property as the popover text
				selectedProperty: "@?",		// Property in the items/objects set to true if selected
				disabledProperty: "@?", 	// Property (boolean) indicating the object is disabled
				config: "=?",				// object with property defs
				onChange: "&",			// Callback when the selection changes; passes back selection as 'selected'
				disabled: "@?",						// this component is disabled
				//returnAsObject: "=?",
				//autoCollapse: "=?"
			},
			controller: function($scope, $q, $timeout) {

				var sbl = this;
				sbl.getDisplayValue = getDisplayValue;
				sbl.toggleSelection = toggleSelection;
				sbl.isOptionVisible = isOptionVisible;
				sbl.isDisabled = isDisabled;
				sbl.isIn = isIn;
				sbl.isSelected = isSelected;

				if (!sbl.config) {
					sbl.config = {};
					if (sbl.disabledProperty) sbl.config.disabled = sbl.disabledProperty;
					if (sbl.disabledOptions) sbl.config.disabled = sbl.disabledOptions;
					if (sbl.displayProperty) sbl.config.display = sbl.displayProperty;
					if (sbl.selectedProperty) sbl.config.selected = sbl.selectedProperty;
					if (sbl.selectedOptions) sbl.config.selected = sbl.selectedOptions;
					if (sbl.titleProperty) sbl.title = sbl.titleProperty;
					if (sbl.sortProperty) sbl.config.sort = sbl.sortProperty;

					if (!sbl.config.selected) sbl.config.selected = [];
				}

				setOptions(sbl.options);

				$scope.$watch('sbl.options',function(newVal,oldVal) {
					if (newVal == oldVal) return;
					$timeout(function() {
						setOptions(newVal);
					})
				});

				function setOptions(options) {
					if (angular.isArray(options)) {
						sbl.config.options = options;
					} else if (angular.isObject(options)) {
						let newOptions = [];
						for (let prop in options) {
							let obj = options[prop];
							newOptions.push(obj);
						}
						sbl.config.options = newOptions;
					}
				}

				function getDisplayValue(obj) {
					if (!obj) return "";
					if (typeof obj === 'string') return obj;
					if (!sbl.config.display || typeof sbl.config.display != 'string' || !obj[sbl.config.display] || typeof obj[sbl.config.display] !== 'string') {
						return '!err';
					}
					return obj[sbl.config.display];
				}

				function isSelected(obj) {
					if (angular.isArray(sbl.config.selected)) {
						return isIn(obj,sbl.config.selected);
					} else if (angular.isString(sbl.config.selected)) {
						return obj[sbl.config.selected];
					}
					return false;
				}

				function isDisabled(obj) {
					if (sbl.disabled) return true
					let isDisabled = false;

					if (angular.isArray(sbl.config.disabled)) {
						return isIn(obj,sbl.config.disabled);
					} else if (angular.isString(sbl.config.disabled)) {
						return obj[sbl.config.disabled];
					}

					return isDisabled;
				}

				function isIn(obj, objs) {
					if (!objs) return false;
					let idx = objs.indexOf(obj);
					return idx > -1;
				}

				function isOptionVisible(obj) {
					return true;
				}

				function toggleSelection(obj, isDisabled) {
					if (sbl.isDisabled(obj)) return;

					if (angular.isArray(sbl.config.selected)) {
						let idx = sbl.config.selected.indexOf(obj);
						if (idx > -1) sbl.config.selected.splice(idx,1)
						else sbl.config.selected.push(obj);
						sbl.onChange({selected: sbl.config.selected});
					} else if (angular.isString(sbl.config.selected)) {
						obj[sbl.config.selected] = !obj[sbl.config.selected];
						if (sbl.onChange) sbl.onChange({selected: obj});
					}

				}

			}
		}

	}]);
