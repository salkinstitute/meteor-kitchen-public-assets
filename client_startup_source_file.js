Meteor.startup(function() {
		this.SawHelpers = {};

		SawHelpers.strToMoney = function(value){
			return accounting.formatMoney(value,'');
		}

		SawHelpers.strToRechargePeriod = function(value){
			return moment(value).format('MMMM YYYY');
		}

		SawHelpers.actualLoadedTemplate = function(){
			return Router.current() && Router.current().route.getName().replace('.','-');
		}

		SawHelpers.userDisplayName = function() {
			var name = "";
			if(Meteor.user() && Meteor.user().profile)
				name = Meteor.user().profile.displayname;
			return name;
		};

		SawHelpers.userMail = function() {
			var email = "";
			if(Meteor.user() && Meteor.user().profile)
				email = Meteor.user().profile.mail;
			return email;
		};

		SawHelpers.employeePicture = function(fileName) {
			console.log('here are all the Images');
			return EmployeePictures.findOne({"name":fileName}); // Where Im
		};

		SawHelpers.userRoles = function() {

			if(Meteor.user() && Meteor.user().profile)
			var	roles = Meteor.user().roles;
			return roles;
		};

		SawHelpers.userHasRole = function(role) {
			if(role){
				 Meteor.call('userHasRole', role, {}, function(err, res) {
					if (err) {
					  console.log(err);
					  return;
					} else {
						Session.set('userHasRole',res);
						return;
					}
				});
				var uhr = Session.get('userHasRole');

				if (uhr) return uhr;

				return 'Loading roles...';
		    }
		};

		_.each(SawHelpers, function (helper, key) {
			Handlebars.registerHelper(key, helper);
		});


		Meteor.loginWithAd = function(username,password,callback) {

		  var loginRequest = {aduser: username, adpwd: password};

		  //send the login request
		  Accounts.callLoginMethod({
		    methodArguments: [loginRequest],
		    userCallback: callback
		  });
		};	
		//have to do this for each modal form with typeahead.
		//would like to DRY this up.	
		//email typeaheads
		Template.DepartmentsEditFieldContactsInsertFormContainerFieldContactsInsertForm.helpers({
			adUsersEmail:function(query, sync, callback) {
		      Meteor.call('searchAdUsers', query, {}, function(err, res) {
			if (err) {
			  console.log(err);
			  return;
			}
			callback(res.map(function(it){ return {value:it.displayname+'('+it.mail+')',id:it.mail}; }));
		      });
		    },
			typeaheadSelected:function(event, suggestion, datasetName){
				typeaheadSelected(event, suggestion, datasetName);
			}

		});
		Template.DepartmentsEditFieldContactsInsertFormContainerFieldContactsInsertForm.rendered = function() {
			Meteor.typeahead.inject();
		};

		Template.DepartmentsInsertFieldContactsInsertFormContainerFieldContactsInsertForm.helpers({
			adUsersEmail:function(query, sync, callback) {
		      Meteor.call('searchAdUsers', query, {}, function(err, res) {
			if (err) {
			  console.log(err);
			  return;
			}
			callback(res.map(function(it){ return {value:it.displayname+'('+it.mail+')',id:it.mail}; }));
		      });
		    },
			typeaheadSelected:function(event, suggestion, datasetName){
				typeaheadSelected(event, suggestion, datasetName);
			}

		});
		Template.DepartmentsInsertFieldContactsInsertFormContainerFieldContactsInsertForm.rendered = function() {
			Meteor.typeahead.inject();
		};
		//funds typeaheads
		Template.DepartmentsEditFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertForm.helpers({
			fundsFundCode:function(query, sync, callback) {
		      Meteor.call('searchFunds', query, {}, function(err, res) {
			if (err) {
			  console.log(err);
			  return;
			}
			callback(res.map(function(it){ return {value:it.fund_code+' ('+it.Banner.FUND_TITLE+')',id:it.fund_code}; }));
		      });
		    },
			typeaheadSelected:function(event, suggestion, datasetName){
				typeaheadSelected(event, suggestion, datasetName);
			}

		});
		Template.DepartmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertForm.helpers({
			fundsFundCode:function(query, sync, callback) {
		      Meteor.call('searchFunds', query, {}, function(err, res) {
			if (err) {
			  console.log(err);
			  return;
			}
			callback(res.map(function(it){ return {value:it.fund_code+' ('+it.Banner.FUND_TITLE+')',id:it.fund_code}; }));
		      });
		    },

			typeaheadSelected:function(event, suggestion, datasetName){
				typeaheadSelected(event, suggestion, datasetName);
			}

		});
		Template.DepartmentsEditFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertForm.rendered = function() {
			Meteor.typeahead.inject();
		};
		Template.DepartmentsEditFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertForm.rendered = function() {
			Meteor.typeahead.inject();
		};
 });


