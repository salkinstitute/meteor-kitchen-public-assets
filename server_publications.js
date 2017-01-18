//Simple search publication for funds
Meteor.publish('fundsSearch', function(query) {
    var self = this;

    try {
    	console.log('sea:' + Meteor.settings.sea.url);
    	
       	 var result = Funds.findOne({fund_code:query});
       	 
       	 console.log(result);

       	 if (typeof result != 'undefined'){
       	 
       	 	console.log('fund already exists in server mongo');
       	 	console.log(result);
       	 	
       	 	self.added('funds', result._id, result);
       	 	
       	 	//return true;
       	 	
       	 
       	 } else {
       	 	
       	 	console.log('fund does not exist on mongo, searching sea..');
       	 		
       	 	 var response = HTTP.get(Meteor.settings.sea.url +'/v1/fund-checker/'+ query, 
       	 	 {auth: Meteor.settings.sea.user+':'+Meteor.settings.sea.password});
       	 	
       	 	 if(response.data[query] && typeof response.data[query] != 'undefined'){
       	 	 	console.log(response.data[query]);
       	 	 	var values = response.data[query];
       	 	 	var doc = {	
					fund_code:values.Banner.FUND_CODE, 
					Banner:values.Banner,
					Grad:values.Grad,
					eSirius:values.eSirius
				};
				
				console.log('api search result doc:');
				console.log(doc);
       	 	 	
       	 	 	Funds.insert(doc);
       	 	 	
       	 	 	//var result = Funds.find({_id:query}).fetch();
       	 	 	
       	 	 	console.log('added fund '+ query+' to collection');
       	 	 	
       	 	 	self.added('funds', doc._id, doc);
       	 	 	
       	 	 	//return result;
       	 	 	
       	 	 } 
       	 	 
       	 	 console.log('fund returned from api:');
       	 	  
       	 	 console.log(response.data[query]);
       	 
       	 }
    	
        self.ready();
        
    } catch (error) {
        
        console.log(error);
    
    }
});
