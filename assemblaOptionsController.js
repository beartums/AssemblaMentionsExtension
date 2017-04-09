// Controller for the assembla mentions options page
angular.module("app")
  .controller("assemblaOptionsController", ['assemblaOptionsService', '$scope',
    function(aos, $scope) {

			// for controller-as syntax
			var vm = this
			vm.manifest = chrome.runtime.getManifest();
			vm.bg = chrome.extension.getBackgroundPage().bg;
			vm.status = aos.status;
			vm.options = aos.options;
			// when a change is made, save the options to chrome storage
			vm.change = aos.saveOptions;
			vm.getColorStyle = getColorStyle;
			vm.getMentionCount = getMentionCount;
			vm.keydown = keydown;
			vm.startEdit = startEdit;


			// have the Options Service call the init function when data has been loaded
			aos.setOnReadyHandler(init);

			$scope.$watch('vm.options.badgeColor',function(newVal,oldVal) {
				//console.log(newVal,oldVal);
				if (typeof oldVal == 'undefined') return;
				if (newVal!=oldVal) vm.change();
			});

			// Set the display objects
			function init() {
				vm.status = aos.status;
				vm.options = aos.options;
			}

			// Not used
			// function toggle(obj,prop) {
			// 	obj[prop] = !obj[prop];
			// 	vm.change()
			// }

			/**
			 * Creat the style string for the color specified
			 * @param  {string} color hex code for setBadgeBackgroundColor
			 * @return {string}       style string including hex code
			 */
			function getColorStyle(color) {
				let style = {
					'background-color': color,
					color: color
				}
				return style;
			}

			/**
			 * Get the current number of mentions for specified user
			 * @param  {user} author user for which to count mentions
			 * @return {number}        number of mentions by specified user
			 */
			function getMentionCount(author) {
				let count = 0;
				vm.bg.userMentions.forEach(function(mention) {
					if (mention.author_id == author.id) count++;
				})
				return count;
			}

			/**
			 * Enable tab, down&uparows, and enter key
			 * @param  {event} e    keydoen event object
			 * @param  {user} user current user
			 * @return {void}
			 */
			function keydown(e, user) {
				switch (e.key) {
					case 'Escape':
						vm.userBeingEdited = null;
						user.initials = vm.userInitialStartValue;
						break;
					case 'Enter':
						vm.userBeingEdited = null
						break;
					case 'ArrowDown':
						vm.userBeingEdited = getUser(user,1);
						break;
					case 'ArrowUp':
						vm.userBeingEdited = getUser(user,-1);
						break;
					case 'Tab':
						vm.userBeingEdited = getUser(user,1);
						break;
				}
			}

			/**
			 * get the user by position relative to the passed user
			 * @param  {object|user} user reference user
			 * @param  {number} skip number of positions to skip forward or backward
			 * @return {user}      user in the specified position
			 */
			function getUser(user,skip) {
				let users = [];
				// Create an array of users in object order
				for (let prop in vm.bg.users) {
					users.push(vm.bg.users[prop]);
				}

				// Calculate the user to return.  Loop from end to beginning and vice versa
				let i = users.indexOf(user);
				let j = i + skip
				if (j<0) {
					j = users.length + j ;
				} else if (j>users.length-1) {
					j = j - users.length
				}
				return users[j]
			}

			/**
			 * Start editing the user initials
			 * @param  {user} user user being edited
			 * @return {void}
			 */
			function startEdit(user) {
				vm.userBeingEdited = user;
				vm.userInitialStartValue = user.initials
			}

			return vm
    }
  ]);
