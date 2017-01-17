import alasql from 'alasql';

Session.setDefault('peopleQuery', false);

Session.setDefault('searching', false);

Session.setDefault('js-person-code-group', false);


//http://experimentsinmeteor.com/photo-blog-part-1/

Template.PeopleSearch.rendered = function() {

	$("#query").focus();
	Meteor.typeahead.inject();
	
	
};
Template.PeopleSearch.helpers({
  images: function () {
  console.log(EmployeePictures.find());
    return EmployeePictures.find(); // Where Images is an FS.Collection instance
  }
});



Template.PeopleSearch.events({
	'submit form': function(e, t) {
        e.preventDefault();

        var query = $.trim(t.$('input[type=text]').val());
        
        console.log(query);

        if (query) {
        	
            Session.set('peopleQuery', query);
            
        	$("#query").focus();    
        }
        
        
        
    },
    
    'click .nav-tabs':function(event){
		$(event.target).tab('show');
	},
	
	'click .go-to-person':function(event){
		event.preventDefault();
		console.log(event.target.getAttribute('href'));
		Session.set('query', event.target.getAttribute('href'));
		$("#query").focus();
	}
});

Tracker.autorun(function() {
    if (Session.get('peopleQuery')) {
        var searchHandle = Meteor.subscribe('peopleSearch', Session.get('peopleQuery'));
        Session.set('searching', ! searchHandle.ready());
    }
});

Template.people_help_block.helpers({
	
   
   helpblock: function(person) {
   
   		console.log('here is the person:' );
   		console.log(person);
   		/*
		if(person !== undefined && person !== null  && person !== false){
		
			if(person.Banner.IS_FUTURE == '1'){			
				Session.set('js-person-code-group',' has-warning');
				return "<p>Fund starts in the future.</p>";
			}
			
			if(person.Banner.IS_EXPIRED == '1'){		
				var msg = "<p>Expired Fund.</p>";
				
				if(person.Banner.NEW_FUND	!== undefined && person.Banner.NEW_FUND !== null){
					msg += '<p><a href="'+person.Banner.NEW_FUND+'" class="go-to-person">'
						+person.Banner.NEW_FUND+ '</a>, is a newer associated person.</p>';								
				}
				
				Session.set('js-person-code-group',' has-warning');
				
				return msg;
			
			}
			
			if(person.Banner.IS_EXPIRED == '0' && person.Banner.IS_FUTURE == '0'){
				Session.set('js-person-code-group',' has-success');
				return "<p>Valid and active person.</p>";
			}	
			
			
	
		} else {
			
			if(Session.get('query')){
				
				Session.set('js-person-code-group',' has-error');
				return "<p>Fund: " + Session.get('query') + " was not found.</p>";
				
			}
		}
		*/
   	
   },
});




Template.PeopleSearch.helpers({
	arrayify : function(obj){
		var result = [];
		for (var key in obj) result.push({name:key,value:obj[key]});
		return result;
	},
	
   persons: function (query) {
   
	return People.find().fetch();
	

   },
   images: function () {
  console.log(EmployeePictures.find());
    return EmployeePictures.find(); // Where Images is an FS.Collection instance
  },
   person: function (query) {
   
	return People.findOne();
	

   },
   
   querytext: function() {
   
   	return Session.get('query');
   
   },
   
   jspersoncodegroup: function() {
   	return Session.get('js-person-code-group');
   },
   
   adUser: function() {
   	return Session.get('adUser');
   },
   
    searching: function() {
        return Session.get('searching');
	},
	personNamePersonCode : function(query, sync, callback) {
      Meteor.call('searchPeople', query, {}, function(err, res) {
        if (err) {
          console.log(err);
          return;
        }
        callback(res.map(function(it){ return {value:it.name,id:it._id}; }));
      });
    },
    typeaheadSelected : function(event, suggestion, datasetName){
	 // $('input[name='+event.target.name+']').typeahead('val', suggestion.id);   
	 
		event.preventDefault();
		
		Router.go("people.details", {personId: suggestion.id});
		return false;

	}
});

