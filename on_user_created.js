import alasql from 'alasql';
// also s. is http://epeli.github.io/underscore.string/#usage

var aduser = AdUsers.findOne({samaccountname:user.username});

if(aduser) {
	user.profile = aduser;
	//console.log(user._id);
	//Meteor.users.update(user._id, {$set: {profile: aduser}});
	
}
console.log('this is the user id from creating an account' + user._id);

var pds = ProfileDefaults.find().fetch();

//console.log(pds); something

_.each(pds,(pd)=>{
	console.log(pd);
	if(pd.is_active == '1' && pd.execute_when == 'on_user_created'){
		
		var sql = 'SELECT * FROM ? as ad WHERE ';
		
		var valueTest ='';
		
		_.each(pd.profile_conditions,(cond)=>{
			
			valueTest = ' ad.' + cond.attribute + ' ' + cond.attribute_operator;
			
			if(cond.attribute_operator == 'in'){
			
				valueTest += '(';
					
				inValsArr = cond.attribute_value.split(',');
				
				_.each(inValsArr,(v)=>{
					
					valueTest += '"'+ v.trim()+'",';
					
				});	
								
				valueTest = s(valueTest).rtrim(',').value() + ')';
					
			}
			
			if(cond.attribute_operator == 'like'){
			
				valueTest += ' ("'+s(cond.attribute_value).trim().value() +'") ';
					
			}
			
			if(cond.attribute_operator == '=' || cond.attribute_operator == '!='){
			
				valueTest += '"'+s(cond.attribute_value).trim().value()+'"';
					
			}
			
			valueTest += ' ' + cond.next_condition_operator;
		});
		
		sql = sql + valueTest;
		//trim off next_condition_operators
		sql = s(sql).rtrim('and').value();
		sql = s(sql).rtrim('or').value();
		
		//and final operator for getting the right user.
		sql += 'and ad.samaccountname ="'+user.username+'"';
		
		console.log('this sql statement would run:' + sql);
		
		var res = alasql(sql,[AdUsers]);

		if (typeof res === undefined || res.length == 0) {
			//do nothing
		
		} else {
			console.log('updating user roles' + pd.roles);
			user.roles = pd.roles;	
		}
	
	}
});