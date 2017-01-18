Meteor.methods({
	/*Server component for role checking so that client js can't be compromised*/
	userHasRole: function (role) {
		if(Users.isInRole(Meteor.userId(),role) && role) {
			return true;
		} else {
			return false;
		}
	},
	createUserAccountSalk: function(options) {
		if(!Users.isAdmin(Meteor.userId())) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var userOptions = {};
		if(options.username) userOptions.username = options.username;
		if(options.email) userOptions.email = options.email;
		if(options.password) userOptions.password = options.password;
		if(options.profile) userOptions.profile = options.profile;
		if(options.profile && options.profile.email) userOptions.email = options.profile.email;
		
		var userId = Accounts.createUser(userOptions);
		
		if(options.roles) {
			
			userOptions.roles = options.roles;
			
			try{
			
				var u = Users.update(userId, { $set: userOptions });
				console.log(u);
				
			} catch(e) {
				
				console.log(e);
				
			}
		
		}
	},
	updateUserAccountSalk: function(userId, options) {
		// only admin or users own profile
		if(!(Users.isAdmin(Meteor.userId()) || userId == Meteor.userId())) {
			throw new Meteor.Error(403, "Access denied.");
		}

		// non-admin user can change only profile
		if(!Users.isAdmin(Meteor.userId())) {
			var keys = Object.keys(options);
			if(keys.length !== 1 || !options.profile) {
				throw new Meteor.Error(403, "Access denied.");
			}
		}

		var userOptions = {};
		if(options.username) userOptions.username = options.username;
		if(options.email) userOptions.email = options.email;
		if(options.password) userOptions.password = options.password;
		if(options.profile) userOptions.profile = options.profile;

		if(options.profile && options.profile.email) userOptions.email = options.profile.email;
		
		if(userOptions.email) {
			var email = userOptions.email;
			delete userOptions.email;
			userOptions.emails = [{ address: email }];
		}

		var password = "";
		if(userOptions.password) {
			password = userOptions.password;
			delete userOptions.password;
		}

		if(userOptions) {
			for(var key in userOptions) {
				var obj = userOptions[key];
				if(_.isObject(obj)) {
					for(var k in obj) {
						userOptions[key + "." + k] = obj[k];
					}
					delete userOptions[key];
				}
			}
			if(options.roles) userOptions.roles = options.roles;
	
			try{
			var u = Users.update(userId, { $set: userOptions });
			console.log(u);
			} catch(e) {
					console.log(e);
						console.log(userId);
					}
		}

		if(password) {
			Accounts.setPassword(userId, password);
		}
	},
	searchDepartments: function(query, options){
		 options = options || {};

		// guard against client-side DOS: hard limit to 50
		if (options.limit) {
			options.limit = Math.min(50, Math.abs(options.limit));
		} else {
			options.limit = 50;
		}

		// TODO fix regexp to support multiple tokens
		var regex = new RegExp("^" + query , "i");
		return Departments.find({
			$or:[
				{dept_code: {$regex:  regex}},
				{dept_name: {$regex:  regex}}
			]},options).fetch();
	},
	searchAdUsers: function(query, options) {
            options = options || {};

            // guard against client-side DOS: hard limit to 50
            if (options.limit) {
                options.limit = Math.min(50, Math.abs(options.limit));
            } else {
                options.limit = 50;
            }

            // TODO fix regexp to support multiple tokens
            var regex = new RegExp("^" + query , "i");
            return AdUsers.find({
            	$or:[
            		{displayname: {$regex:  regex}},
            		{mail: {$regex:  regex}},
            		{samaccountname:{$regex:  regex}},
            	]},options).fetch();
        },
    	searchPeople: function(query, options) {
            options = options || {};

            // guard against client-side DOS: hard limit to 50
            if (options.limit) {
                options.limit = Math.min(50, Math.abs(options.limit));
            } else {
                options.limit = 50;
            }

            // TODO fix regexp to support multiple tokens
            var regex = new RegExp("^" + query , "i");
            return People.find({
            	$or:[
            		{name: {$regex:  regex}},
            		{title: {$regex:  regex}},
            		{department:{$regex:  regex}},
            		{person_code:{$regex:  regex}},
            	]},options).fetch();
        },
       
	searchFunds: function(query, options) {
		options = options || {};

		// guard against client-side DOS: hard limit to 50
		if (options.limit) {
			options.limit = Math.min(50, Math.abs(options.limit));
		} else {
			options.limit = 50;
		}
				
		var regex = new RegExp("^" + query , "i");
	
		return Funds.find({
			$or:[
				{"Banner.FUND_TITLE": {$regex:  regex}}, 
				{fund_code:{$regex:  regex}}
			]}, options).fetch();	
		
	},
	
	authenticateRest: function(user,pwd) {
		try{
		
			return HTTP.call("POST", Meteor.settings.accountsRestAuth.url,
				 {auth: Meteor.settings.accountsRestAuth.user+':'+Meteor.settings.accountsRestAuth.password,
				 data: {username: user, password: pwd}
				 }
			); 
	  	
	  	} catch(error) {
	  		throw new Meteor.Error(401, "Could not authenticate");
	  	}
	},
	updateDepartmentFunds: function(){
		//loop thru all active depts and check/replace/remove funds and 
		// add to departments_activity
		var depts = Departments.find({is_active:1}).fetch();
		
		var goodFunds = Funds.find({$and:[{"Banner.IS_EXPIRED":"0"},{"Banner.IS_FUTURE":"0"}]}).fetch().map(function(f) { 
			return f.Banner.FUND_CODE;
		});  
		
		_.each(depts,(dept)=>{
			
			_.each(dept.default_funds,(df)=>{
				
				if(df.override_validation == false){
					
					var fundValid = goodFunds.indexOf(df.default_fund); 
					
					if(fundValid == -1){ //not found, not valid
						
						var newFund = false;
						
						var localNewFund = Funds.findOne({fund_code:df.default_fund});
						
						if(localNewFund && typeof localNewFund != undefined && typeof localNewFund.Banner.NEW_FUND != undefined && localNewFund.Banner.NEW_FUND != ''){
							newFund = localNewFund.Banner.NEW_FUND;
							
							var udf = Funds.update({$and:[{_id:dept.id},{"default_funds._id":df._id}]}, {$set:{"default_funds.$default_fund":newFund}});
							
							console.log(udf);
							
							var activity = {
								departmentId:dept._id,
								dept_code:dept.dept_code,
								details:"Default fund type "+df.default_type+":"+df.default_fund+" updated with new fund: "+ newFund,
								activity_type:"Renewed Fund",
								action_needed:0
							}
			
							var aId = DepartmentsActivity.insert(activity);
							
							
						} else {
						
							var activity = {
								departmentId:dept._id,
								dept_code:dept.dept_code,
								details:"Default fund type "+df.default_type+":"+df.default_fund+" is not valid and no replacement fund was found.  Please update the default fund for this department / type",
								activity_type:"Expired Fund",
								action_needed:1
							}
			
							var aId = DepartmentsActivity.insert(activity);
						
						}
					}
				}
				
			});
			
		});
	},
	updatePeople: function() {
  		
		console.log('Running updatePeople');

		const response = HTTP.get(Meteor.settings.sea.url+'/v1/people/',
			{auth: Meteor.settings.sea.user+':'+Meteor.settings.sea.password}
		);
	
		var ApiPersonCodes = [];
	
		var collectionPersonCodes = People.find({fields: {'person_code':1}}).fetch().map(function(f) { 
				return f.person_code;
			});  
		
		_.each(response.data,(person) => {
	
			ApiPersonCodes.push(person.person_code);
			
			//check to see if a new person.
			var foundInCurrentPeople = collectionPersonCodes.indexOf(person.person_code); 
	
			var aId = false;
	
			if(foundInCurrentPeople == -1){
	
				var activity = {
					person_code:person.person_code,
					details:"New person pulled from EP. Do some ingress workflow bro",
					activity_type:"New Person",
					action_needed:1
				}
	
				var aId = PeopleActivity.insert(activity);
	
			}
			
			if(person.p_first != ''){
				person.name = person.p_first;
			}
			
			else {
				person.name = person.first_name;
			}
			
			if(person.p_last != ''){
				person.name += ' ' + person.p_last;
			}
			
			else {
				person.name += ' ' + person.last_name;
			}
			
			person.employee_picture = person.person_code + '.JPG';
			
			var u = People.update(
				{person_code:person.person_code}, 
				{$set:person},
				{upsert:true}
			);
	
			if(aId !== false){
		
				var insertedPerson = People.findOne({person_code:person.person_code});
		
				PeopleActivity.update({_id:aId},{$set:{personId:insertedPerson._id}});
	
			}
	
		});

	},
	
	updateDepartments: function() {
  		
  		console.log('Running updateDepartments');
  	
		const response = HTTP.get(Meteor.settings.sea.url+'/v1/departments/all-active',
			{auth: Meteor.settings.sea.user+':'+Meteor.settings.sea.password}
		);
		
		var ApiIds = [];
		//put all the active departments from mongo into play
		var cIds = Departments.find({is_active:1}, {fields: {'dept_code':1}}).fetch().map(function(f) { 
			return f.dept_code;
		});  

		_.each(response.data,(dept) => {
			
			ApiIds.push(dept.DEPARTMENT_CODE);
			//Authoritative fields from EP for depts
			var doc = {
			
				dept_code:dept.DEPARTMENT_CODE,
				dept_name:dept.ORG_LEVEL_2_DESC,
				dept_head_person_code:dept.DEPT_HEAD_PERSON_CODE,
				is_core:dept.CORE,
				dept_type:dept.AUTH_AREA,
				is_active:1
			}
			//case we have a value in this app first, later can be overwritten
			//with non-null value automatically.
			if(dept.DEPT_HEAD_PERSON_CODE == null){
				delete doc['dept_head_person_code'];
			} else {
				//de-normalize the name from pcode for better performance.
				var name = AdUsers.findOne({employeeid:dept.DEPT_HEAD_PERSON_CODE});
				doc.dept_head_name = name.displayname;
			}
			
			console.log(dept.DEPARTMENT_CODE + ' from response sea');
			
			//check to see if a new department.
			var foundInCurrentDepts = cIds.indexOf(dept.DEPARTMENT_CODE); 
			
			var aId = false;
			
			if(foundInCurrentDepts == -1){
			
				var activity = {
					dept_code:dept.DEPARTMENT_CODE,
					details:"New department pulled from EP. Someone needs to set the department contacts & funds.",
					activity_type:"New Department",
					action_needed:1
				}
			
				var aId = DepartmentsActivity.insert(activity);
			
			}
			
			var u = Departments.update({dept_code:dept.DEPARTMENT_CODE}, {$set:doc},{upsert:true});
			
			if(aId !== false){
				
				var insertedDept = Departments.findOne({dept_code:dept.DEPARTMENT_CODE});
				
				DepartmentsActivity.update({_id:aId},{$set:{departmentId:insertedDept._id}});
			
			}
		
			
		});
		
		var inMongoNotApi = _.difference(cIds,ApiIds);
		
		//the depts that are only in mongo need to be set to inactive.
		
		_.each(inMongoNotApi,(deptCode) => {
			
			var d = Departments.update({dept_code:deptCode},{$set:{is_active:0}});
			
			if(d){
			
				var deactivatedDept = Departments.findOne({dept_code:deptCode});
				
				var activity = {
					departmentId:deactivatedDept._id,
					dept_code:deptCode,
					details:"Department Deactivated, no longer in EP as active",
					activity_type:"Department Deactivation",
					action_needed:0
				}
				
				DepartmentsActivity.insert(activity);
			}
		});
		
		console.log('updateDepartments finished');
	},
	
	updateAdUsers: function() {
  		
  		console.log('Running updateAdUsers');
  	
		const response = HTTP.get(Meteor.settings.sea.url+'/v1/ad/all-active',
			{auth: Meteor.settings.sea.user+':'+Meteor.settings.sea.password}
		);
		
		var ApiIds = [];
		
		var cIds = AdUsers.find({}, {fields: {'samaccountname':1}}).fetch().map(function(f) { 
			return f.samaccountname;
		});  
		
		
		//console.log('These are the existing collection ids (samaccountname) :');
		//console.log(cIds);
		
		_.each(response.data,(adUser) => {
			
			ApiIds.push(adUser.samaccountname);
			
			//console.log(adUser.samaccountname + ' from response sea');
			
			var u = AdUsers.update({samaccountname:adUser.samaccountname}, {$set:adUser},{upsert:true});
			
			if(u){
				//console.log(adUser.samaccountname + 
				//' refreshed/inserted from API into Mongo collection');
			}
			
		});
		
		var inMongoNotApi = _.difference(cIds,ApiIds);
		
		//the ads that are only in mongo need to be set to inactive.
		
		_.each(inMongoNotApi,(adUser) => {
			
			var a = AdUsers.update({samaccountname:adUser.samaccountname},{$set:{is_active:0}});
			
			if(a){
				console.log(adUser.samaccountname + ' deactivated!');
			}
		});
		
		
		console.log('updateAdUsers finished');
	},
	updateFunds: function() {
  		
  		console.log('Running updateFunds');
  	
		const response = HTTP.get(Meteor.settings.sea.url+'/v1/fund-checker/all-valid',
			{auth: Meteor.settings.sea.user+':'+Meteor.settings.sea.password}
		);
		
		var ApiIds = [];
		
		var cIds = Funds.find({}, {fields: {'fund_code':1}}).fetch().map(function(f) { 
			return f.fund_code;
		});  
		
		_.each(response.data,(values, fundCode) => {
			
			ApiIds.push(fundCode);
			
			var doc = {	
				fund_code:fundCode,
				Banner:values.Banner,
				Grad:values.Grad,
				eSirius:values.eSirius
			};
			
			var u = Funds.update({fund_code:fundCode}, {$set:doc},{upsert:true});
			
		});

		var inMongoNotApi = _.difference(cIds,ApiIds);
		
		console.log('Missing from funds pull:');
		console.log(inMongoNotApi);
		
		if(inMongoNotApi.length > 0){
		
			const diff_response = HTTP.get(Meteor.settings.sea.url +'/v1/fund-checker/'+inMongoNotApi.toString(),
				{auth: Meteor.settings.sea.user+':'+Meteor.settings.sea.password}
			);
		
		
	
			_.each(diff_response.data,(values, fundCode) => {
		
				console.log(fundCode + ' from response sea funds');

				var sdoc = {		
					Banner:values.Banner,
					Grad:values.Grad,
					eSirius:values.eSirius
				};

				Funds.update(fundCode, sdoc);

			});
		
		}
		
		console.log('updateFunds finished');
	}
});
