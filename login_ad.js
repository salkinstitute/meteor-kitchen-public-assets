var pageSession = new ReactiveDict();

pageSession.set("errorMessage", "");

Template.Login.rendered = function() {
	
	$("input[autofocus]").focus();
};

Template.Login.created = function() {
	pageSession.set("errorMessage", "");
		
};

Template.Login.events({
	"submit #login_form": function(e, t) {
	
		e.preventDefault();
		
		pageSession.set("errorMessage", "");

		var submit_button = $(t.find(":submit"));

		var login_username = t.find('#login_username').value.trim();
		var login_password = t.find('#login_password').value;

		
		// check password
		if(login_password == "")
		{
			pageSession.set("errorMessage", "Please enter your password.");
			t.find('#login_username').focus();
			return false;
		}

		submit_button.button("loading");
		//console.log('some bullshit happening here, with these vars:)');
		//console.log(login_username + ' ' + login_password);
		
		Meteor.loginWithAd(login_username, login_password, function(err) {
			submit_button.button("reset");
			if (err)
			{
				console.log(err);
				pageSession.set("errorMessage", err.message);
				return false;
			}
		});
		return false; 
	}

	
	
});

Template.Login.helpers({
	errorMessage: function() {
		return pageSession.get("errorMessage");
	}
	
});
