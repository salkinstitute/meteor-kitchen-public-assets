import alasql from 'alasql';

Session.setDefault('query', false);

Session.setDefault('searching', false);

Session.setDefault('js-fund-code-group', false);

Template.Funds.rendered = function() {

	$("#query").focus();
	Meteor.typeahead.inject();
	
	
};

Template.Funds.events({
	'submit form': function(e, t) {
        e.preventDefault();

        var query = $.trim(t.$('input[type=text]').val());
        
        console.log(query);

        if (query) {
        	
            Session.set('query', query);
            
        	$("#query").focus();    
        }
        
        
        
    },
    
    'click .nav-tabs':function(event){
		$(event.target).tab('show');
	},
	
	'click .go-to-fund':function(event){
		event.preventDefault();
		console.log(event.target.getAttribute('href'));
		Session.set('query', event.target.getAttribute('href'));
		$("#query").focus();
	}
});

Tracker.autorun(function() {
    if (Session.get('query')) {
        var searchHandle = Meteor.subscribe('fundsSearch', Session.get('query'));
        Session.set('searching', ! searchHandle.ready());
    }
});
Template.fund_help_block.helpers({
	
   
   helpblock: function(fund) {
   
   		console.log('here is the fund:' );
   		console.log(fund);
   		
		if(fund !== undefined && fund !== null  && fund !== false){
		
			if(fund.Banner.IS_FUTURE == '1'){			
				Session.set('js-fund-code-group',' has-warning');
				return "<p>Fund starts in the future.</p>";
			}
			
			if(fund.Banner.IS_EXPIRED == '1'){		
				var msg = "<p>Expired Fund.</p>";
				
				if(fund.Banner.NEW_FUND	!== undefined && fund.Banner.NEW_FUND !== null){
					msg += '<p><a href="'+fund.Banner.NEW_FUND+'" class="go-to-fund">'
						+fund.Banner.NEW_FUND+ '</a>, is a newer associated fund.</p>';								
				}
				
				Session.set('js-fund-code-group',' has-warning');
				
				return msg;
			
			}
			
			if(fund.Banner.IS_EXPIRED == '0' && fund.Banner.IS_FUTURE == '0'){
				Session.set('js-fund-code-group',' has-success');
				return "<p>Valid and active fund.</p>";
			}	
			
			
	
		} else {
			
			if(Session.get('query')){
				
				Session.set('js-fund-code-group',' has-error');
				return "<p>Fund: " + Session.get('query') + " was not found.</p>";
				
			}
		}
   	
   },
});


Template.animal_help_block.helpers({
	
	animalhelpblock: function (fund) {
	
		var SpeciesCrosswalk = {
			mice:['mice'],
			rabt:['rabbits','rabt'],
			gpig:['guinea pigs','gpig'],
			rats:['rats'],
			zfish:['zfish','zebra fish'],
			gfsh:['gfsh'],
			frrt:['ferret','ferrets','frrt'],
			cats:['cats'],
			xtro:['xtro'],
			frxl:['frogs','frxl'],
			off:['off'],
			axo:['axo'],
			macq:['monkey','monkeys','macq'],
			marm:['marm'],
			nr:['not restricted']
		};
		
		var GrantSpecies =[];
		
		var messages ='';

		//has a Grad record
		if(typeof fund.Grad !== undefined && fund.Grad !== null ){
			//Grad species is empty
			
			if(typeof fund.Grad.Species == undefined || fund.Grad.Species == null || _.uniq(fund.Grad.Species) ==''){
			
				return "<p class='text-danger bg-danger text-right pull-right'><strong>No animal use allowed.</strong></p>";
			
			}
		
			else {
				
				messages = "<p class='text-right'><dl><dt>Animal Use</dt><dd><ul>";
				
				//translate / load grant species
				_.each(fund.Grad.Species,(s) => {
					
					s = s.toLowerCase().trim();
					
					_.each(SpeciesCrosswalk,(values,name) =>{
					
						if(values.indexOf(s) !== -1){
							GrantSpecies.push(name);
						} 
					
					});
				
				});
				
				console.log('Grant Species: '+GrantSpecies.join());
							
				//iterate through protocols, translate and intersect species
				_.each(fund.eSirius,(values,protocol)=>{
					
					var ps = [];
					
					var okToUse = [];
					
					_.each(values.SPECIES,(s)=>{
						ps.push(s.toLowerCase().trim());
					});
					
					console.log('protocol ' + protocol + ps.join());
					
					//do an exception for value == 'Not restricted' (nr) 
					
					console.log('indexof nr ' + GrantSpecies.indexOf('nr'));
					
					if(GrantSpecies.indexOf('nr') > -1){
						
						okToUse = ps;
						
					}
					
					else {
					
						okToUse = _.intersection(GrantSpecies,ps);
					
					}
					
					if(okToUse[0] !== undefined){
						messages += "<li class='bg-default'> <strong class='text-primary'> "+okToUse.join()+"</strong> Ok to use with Protocol: <strong >"+protocol+"</strong></li>";
					}
				
				});
				
				return '</ul></dd></dl></p>' +messages;
		
			}
		//no grad record
		} else {
			//does not have an associated Grad record
			return "<p class='text-right bg-default'><dl><dt>Animal Use</dt><dd class='text-warning'>Subject to RACT review.</dd></dl></p>";
	
		}
   
   }
   
});

Template.Funds.helpers({
	arrayify : function(obj){
		var result = [];
		for (var key in obj) result.push({name:key,value:obj[key]});
		return result;
	},
	
   funds: function (query) {
   
	return Funds.find().fetch();
	

   },
   fund: function (query) {
   
	return Funds.findOne();
	

   },
   
   querytext: function() {
   
   	return Session.get('query');
   
   },
   
   jsfundcodegroup: function() {
   	return Session.get('js-fund-code-group');
   },
   
   adUser: function() {
   	return Session.get('adUser');
   },
   
   canViewFund: function(fundCode) {
   
   	console.log(fundCode);
	console.log(Meteor.user());
    //restrict some funds based on department, alternately there are global restrictions
    var restrictions='';
    
    if(false ){
		restrictions = '  (f.Banner.FUND_CODE = "212191") OR (f.Banner.FUND_CODE= "212190") OR (f.Banner.FUND_CODE LIKE("69%")) OR (f.Banner.FUND_CODE  LIKE("9%")) OR (f.Banner.FUND_CODE  LIKE("2128%"))OR (f.Banner.FUND_CODE  LIKE("213%")) OR (f.Banner.FUND_CODE  LIKE("211%")) OR (f.Banner.FUND_CODE = "190") ';
		//OR (f.Banner.ORG_PRED1 in ("1", "2"))';
   	} else {
   		restrictions = ' f.Banner.FUND_CODE IN("990000","212190","212191") OR f.Banner.FUND_CODE LIKE("4%") OR f.Banner.FUND_CODE LIKE("69%") OR f.Banner.FUND_CODE LIKE("2128%")';
   	
   	}
	
	 	
	var res = alasql('SELECT * FROM ? as f WHERE '+restrictions,[Funds]);

	console.log(res);
	
	if (typeof res === undefined || res.length == 0) {
		console.log('you can view the fund bro');
		return true;	
	} else {
		console.log('bro, you can not view the fund');
		return false;
	}
   		
   },
    searching: function() {
        return Session.get('searching');
	}
});

