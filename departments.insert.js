var pageSession = new ReactiveDict();

Template.DepartmentsInsert.rendered = function() {
	
};

Template.DepartmentsInsert.events({
	
});

Template.DepartmentsInsert.helpers({
	
});

Template.DepartmentsInsertInsertForm.rendered = function() {
	Meteor.typeahead.inject();
									Meteor.subscribe('adusers');pageSession.set("defaultFundsCrudItems", []);
pageSession.set("contactsCrudItems", []);


	pageSession.set("departmentsInsertInsertFormInfoMessage", "");
	pageSession.set("departmentsInsertInsertFormErrorMessage", "");

	$(".input-group.date").each(function() {
		var format = $(this).find("input[type='text']").attr("data-format");

		if(format) {
			format = format.toLowerCase();
		}
		else {
			format = "mm/dd/yyyy";
		}

		$(this).datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			forceParse: false,
			keyboardNavigation: false,
			format: format
		});
	});

	$("input[type='file']").fileinput();
	$("select[data-role='tagsinput']").tagsinput();
	$(".bootstrap-tagsinput").addClass("form-control");
	$("input[autofocus]").focus();
};

Template.DepartmentsInsertInsertForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("departmentsInsertInsertFormInfoMessage", "");
		pageSession.set("departmentsInsertInsertFormErrorMessage", "");

		var self = this;

		function submitAction(msg) {
			var departmentsInsertInsertFormMode = "insert";
			if(!t.find("#form-cancel-button")) {
				switch(departmentsInsertInsertFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("departmentsInsertInsertFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("departments", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("departmentsInsertInsertFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				values.contacts = pageSession.get("contactsCrudItems");
values.default_funds = pageSession.get("defaultFundsCrudItems"); newId = Departments.insert(values, function(e) { if(e) errorAction(e); else submitAction(); });
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		

		Router.go("departments", {});
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		/*CLOSE_REDIRECT*/
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		/*BACK_REDIRECT*/
	}, 

	'click .field-contacts .crud-table-row .delete-icon': function(e, t) { e.preventDefault(); var self = this; bootbox.dialog({ message: 'Delete? Are you sure?', title: 'Delete', animate: false, buttons: { success: { label: 'Yes', className: 'btn-success', callback: function() { var items = pageSession.get('contactsCrudItems'); var index = -1; _.find(items, function(item, i) { if(item._id == self._id) { index = i; return true; }; }); if(index >= 0) items.splice(index, 1); pageSession.set('contactsCrudItems', items); } }, danger: { label: 'No', className: 'btn-default' } } }); return false; },
'click .field-default_funds .crud-table-row .delete-icon': function(e, t) { e.preventDefault(); var self = this; bootbox.dialog({ message: 'Delete? Are you sure?', title: 'Delete', animate: false, buttons: { success: { label: 'Yes', className: 'btn-success', callback: function() { var items = pageSession.get('defaultFundsCrudItems'); var index = -1; _.find(items, function(item, i) { if(item._id == self._id) { index = i; return true; }; }); if(index >= 0) items.splice(index, 1); pageSession.set('defaultFundsCrudItems', items); } }, danger: { label: 'No', className: 'btn-default' } } }); return false; }
});

Template.DepartmentsInsertInsertForm.helpers({
	"infoMessage": function() {
		return pageSession.get("departmentsInsertInsertFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("departmentsInsertInsertFormErrorMessage");
	}, 
		"contactsCrudItems": function() {
		return pageSession.get("contactsCrudItems");
	},
	"defaultFundsCrudItems": function() {
		return pageSession.get("defaultFundsCrudItems");
	},
"adUsersPersonCode": function () {
										 return AdUsers.find().fetch().map(function(it){ return {value:it.displayname,id:it.employeeid}; });   
									},
									"adUsersEmail": function () {
										 return AdUsers.find().fetch().map(function(it){ return {value:it.displayname+'('+it.mail+')',id:it.mail}; });   
									},
									"tt_selected":function(event, suggestion, datasetName) {$('input[name='+event.target.name+']').typeahead('val', suggestion.id);}
});

Template.DepartmentsInsertFieldContactsInsertFormContainerFieldContactsInsertForm.helpers({

"adUsersPersonCode": function () {
										 return AdUsers.find().fetch().map(function(it){ return {value:it.displayname,id:it.employeeid}; });   
									},
									"adUsersEmail": function () {
										 return AdUsers.find().fetch().map(function(it){ return {value:it.displayname+'('+it.mail+')',id:it.mail}; });   
									},
									"tt_selected":function(event, suggestion, datasetName) {$('input[name='+event.target.name+']').typeahead('val', suggestion.id);}
								
});

Template.DepartmentsInsertFieldContactsInsertFormContainerFieldContactsInsertForm.rendered = function() {
	
Meteor.typeahead.inject();
Meteor.subscribe('adusers');
	pageSession.set("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormInfoMessage", "");
	pageSession.set("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormErrorMessage", "");

	$(".input-group.date").each(function() {
		var format = $(this).find("input[type='text']").attr("data-format");

		if(format) {
			format = format.toLowerCase();
		}
		else {
			format = "mm/dd/yyyy";
		}

		$(this).datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			forceParse: false,
			keyboardNavigation: false,
			format: format
		});
	});

	$("input[type='file']").fileinput();
	$("select[data-role='tagsinput']").tagsinput();
	$(".bootstrap-tagsinput").addClass("form-control");
	$("input[autofocus]").focus();
};

Template.DepartmentsInsertFieldContactsInsertFormContainerFieldContactsInsertForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormInfoMessage", "");
		pageSession.set("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormErrorMessage", "");

		var self = this;

		function submitAction(msg) {
			var departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormMode = "insert";
			if(!t.find("#form-cancel-button")) {
				switch(departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormInfoMessage", message);
					}; break;
				}
			}

			/*SUBMIT_REDIRECT*/
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				var data = pageSession.get("contactsCrudItems") || []; values._id = Random.id(); data.push(values); pageSession.set("contactsCrudItems", data); $("#field-contacts-insert-form").modal("hide"); e.currentTarget.reset();
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		$("#field-contacts-insert-form").modal("hide"); t.find("form").reset();

		/*CANCEL_REDIRECT*/
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		/*CLOSE_REDIRECT*/
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		/*BACK_REDIRECT*/
	}

	
});

Template.DepartmentsInsertFieldContactsInsertFormContainerFieldContactsInsertForm.helpers({
	"infoMessage": function() {
		return pageSession.get("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("departmentsInsertFieldContactsInsertFormContainerFieldContactsInsertFormErrorMessage");
	}
	
});


Template.DepartmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertForm.rendered = function() {
	
Meteor.typeahead.inject();
Meteor.subscribe('funds');
	pageSession.set("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormInfoMessage", "");
	pageSession.set("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormErrorMessage", "");

	$(".input-group.date").each(function() {
		var format = $(this).find("input[type='text']").attr("data-format");

		if(format) {
			format = format.toLowerCase();
		}
		else {
			format = "mm/dd/yyyy";
		}

		$(this).datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			forceParse: false,
			keyboardNavigation: false,
			format: format
		});
	});

	$("input[type='file']").fileinput();
	$("select[data-role='tagsinput']").tagsinput();
	$(".bootstrap-tagsinput").addClass("form-control");
	$("input[autofocus]").focus();
};

Template.DepartmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormInfoMessage", "");
		pageSession.set("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormErrorMessage", "");

		var self = this;

		function submitAction(msg) {
			var departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormMode = "insert";
			if(!t.find("#form-cancel-button")) {
				switch(departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormInfoMessage", message);
					}; break;
				}
			}

			/*SUBMIT_REDIRECT*/
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				var data = pageSession.get("defaultFundsCrudItems") || []; values._id = Random.id(); data.push(values); pageSession.set("defaultFundsCrudItems", data); $("#field-default_funds-insert-form").modal("hide"); e.currentTarget.reset();
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		$("#field-default_funds-insert-form").modal("hide"); t.find("form").reset();

		/*CANCEL_REDIRECT*/
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		/*CLOSE_REDIRECT*/
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		/*BACK_REDIRECT*/
	}

	
});

Template.DepartmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertForm.helpers({
	"fundsFundCode": function () {
										 return Funds.find().fetch().map(function(it){ return {value:it.fund_code+' ('+it.Banner.FUND_TITLE+')',id:it.fund_code}; });   
									},
									"tt_selected":function(event, suggestion, datasetName) {$('input[name='+event.target.name+']').typeahead('val', suggestion.id);},
								
	"infoMessage": function() {
		return pageSession.get("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("departmentsInsertFieldDefaultFundsInsertFormContainerFieldDefaultFundsInsertFormErrorMessage");
	}
	
});