import { Accounts } from 'meteor/accounts-base';
import alasql from 'alasql';

SyncedCron.options.collectionName = 'cronjobs';

SyncedCron.add({
		name: 'Update Departments',
		schedule: function(parser) {
			return parser.text('every 3 hours'); // parser is a later.parse object
		},
		job: function() {
			Meteor.call('updateDepartments');
		}
	});
SyncedCron.add({
		name: 'Update AdUsers',
		schedule: function(parser) {
			return parser.text('every 2 hours'); // parser is a later.parse object
		},
		job: function() {
			Meteor.call('updateAdUsers');
		}
	});
SyncedCron.add({
		name: 'Update Funds',
		schedule: function(parser) {
			return parser.text('every 7 hours'); // parser is a later.parse object
		},
		job: function() {
			Meteor.call('updateFunds');
		}
});	
SyncedCron.add({
		name: 'Update Department Funds',
		schedule: function(parser) {
			return parser.text('every 1 days'); // parser is a later.parse object
		},
		job: function() {
			Meteor.call('updateDepartmentFunds');
		}
});	
SyncedCron.add({
		name: 'Update People',
		schedule: function(parser) {
			return parser.text('every 1 hour'); // parser is a later.parse object
		},
		job: function() {
			Meteor.call('updatePeople');
		}
});	


// Startup
Meteor.startup(function() {
    //check to see if this is first server startup, and collections
    // have data.  Initialize collections with immediate calls if they are
    // empty.
    var a = AdUsers.find().count();
    var d = Departments.find().count();
    var f = Funds.find().count();
    var xtr = Xtroles.find().count();
    var pds = ProfileDefaults.find().count();
    var p = People.find().count();
    
    if(p == 0){
    	Meteor.call('updatePeople');
    }
    if(a == 0){
    	Meteor.call('updateAdUsers');
    }
    if(d == 0){
    	Meteor.call('updateDepartments');
    }
    if(f == 0){
    	Meteor.call('updateFunds');
    	Meteor.call('updateDepartmentFunds');
    }
    if(xtr == 0){

    	var roles = [
			{
				"name":"departments.super",
				"title":"Depts - Super"
			},
			{
				"name":"departments.admin",
				"title":"Depts - Admin"
			},
			{
				"name":"departments.user",
				"title":"Depts - User"
			},
			{
				"name":"departments.blocked",
				"title":"Depts - Block"
			},	
			{
			"name":"gmc_recharges.super",
			"title":"GMC - Super"
			},
			{
				"name":"gmc_recharges.admin",
				"title":"GMC - Admin"
			},
			{
				"name":"gmc_recharges.user",
				"title":"GMC - User"
			},
			{
				"name":"gmc_recharges.blocked","title":"GMC - Block"
			},
			{
			"name":"funds.super","title":"Funds - Super"
			},
			{"name":"funds.admin","title":"Funds - Admin"},
			{"name":"funds.user","title":"Funds - User"},
			{"name":"funds.blocked","title":"Funds - Block"},
			{"name":"funds.grantProtocolAccess","title":"Funds - Grant Protocol Access"},
			{"name":"funds.restricted","title": "Funds - Restricted"},
			{"name":"super","title":"SAW - Super"},
			{"name":"admin","title":"SAW - Admin"},
			{"name":"user","title":"SAW - User"},
			{"name":"people.user","title":"People - User"},
			{"name":"people.admin","title":"People - Admin"},
			{"name":"people.super","title":"People - Super"},
			{"name":"people.blocked","title":"People - Blocked"}
		];

		_.each(roles, function(doc) { 
		  Xtroles.insert(doc);
		});
	
    
    }
    
    if(pds == 0){
    	var profileRoles =[
    		{
				"config_name" : "IS Super",
				"is_active" : true,
				"roles" : [
					"super",
					"admin",
					"user"
				],
				"execute_when" : [
					"on_user_created"
				],
				"profile_conditions" : [
					{
						"attribute" : "department",
						"attribute_operator" : "=",
						"attribute_value" : "IS",
						"next_condition_operator" : "and",
						"_id" : "oJ5ogACQACcdTr5yE"
					}
				]
			}
    	];
    	
    	_.each(profileRoles, function(doc) { 
		  ProfileDefaults.insert(doc);
		});
    	
    }
    
    // Start scheduled update jobs
    SyncedCron.start();
});


/*
fundsFundCode = function(){
   return Funds.find().fetch().map(function(it){ return {value:it.fund_code+' ('+it.Banner.FUND_TITLE+')',id:it.fund_code}; });   
}
*/

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

Accounts.registerLoginHandler(function(loginRequest) {
	//console.log('made it to custom login handler, here are the vars');
	//console.log(loginRequest);
  
	 var a = Meteor.call('authenticateRest',loginRequest.aduser,loginRequest.adpwd);
	 
	 if(typeof a !== undefined && typeof a !== null){
		 if(a.data.ldapResult == true){
			var adUser = a.data.adUser[0];
			//console.log('adUser:');
			//console.log(adUser);
			var user = Meteor.users.findOne({username:adUser.samaccountname});
		
			if(!user){
				var userOptions = {};
				console.log('here is the adUser');
				console.log(adUser.samaccountname);
			
				userOptions.username = adUser.samaccountname;
				
				userOptions.email = adUser.mail;
				//if(options.password) userOptions.password = options.password;
				userOptions.profile = adUser;
				
				userOptions.profile.username = adUser.samaccountname;
			
				var userId = Accounts.createUser(userOptions);
			} else {
			
				userId = user._id;
			}
					  
			return {userId: userId};
			
		 } else {
		 	//console.log('im here');
			throw new Meteor.Error(400, "Could not authenticate")
			
		 }
		} else {
			//console.log('no im here');
			throw new Meteor.Error(400,"Something bad happened");
		}
	 

});



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

Meteor.startup(function () {  
  AdUsers._ensureIndex({ "samaccountname": 1});
  AdUsers._ensureIndex({ "employeeid": 1});
  AdUsers._ensureIndex({"displayname":1});
  AdUsers._ensureIndex({"distinguishedname":1});
  AdUsers._ensureIndex({"mail":1});
  
  Departments._ensureIndex({"dept_head_person_code":1});
  Departments._ensureIndex({"dept_code":1});
  Departments._ensureIndex({"dept_head_name":1});
  
  DepartmentsActivity._ensureIndex({"createdAt":1});
  DepartmentsActivity._ensureIndex({"action_needed":1});
  
  People._ensureIndex({"person_code":1});
  People._ensureIndex({"first_name":1});
  People._ensureIndex({"last_name":1});
  People._ensureIndex({"p_first":1});
  People._ensureIndex({"p_last":1});
  People._ensureIndex({"department":1});
  People._ensureIndex({"employment_status":1});
  People._ensureIndex({"employment_title":1});
  
  //need to put in nested indexes for Funds
  Funds._ensureIndex({"fund_code":1}); 
  Funds._ensureIndex({"Banner.FUND_TITLE":1}); 
});
/*
AWS.config.update({
	"accessKeyId": Meteor.settings.AWS.accessKeyId,
    "secretAccessKey": Meteor.settings.AWS.secretAccessKey,
    "bucket": "salk-employee-pics"	
});
*/
/*
s3 = new AWS.S3();

list = s3.listObjectsSync({
	"Bucket": "salk-employee-pics"
});
 
console.log(list);
*/
/*
{
				"name":"employeePictures",
				"type": "file_collection",
				"storage_adapters": ["s3"]
			},
			*/
var employeePictures = new FS.Store.S3("images", {
  //region: "my-s3-region", //optional in most cases
  accessKeyId:  Meteor.settings.AWS.accessKeyId, //required if environment variables are not set
  secretAccessKey: Meteor.settings.AWS.secretAccessKey, //required if environment variables are not set
  bucket: "salk-employee-pics"	 //required
 // ACL: "myValue", //optional, default is 'private', but you can allow public or secure access routed through your app URL
 // folder: "folder/in/bucket", //optional, which folder (key prefix) in the bucket to use 
  // The rest are generic store options supported by all storage adapters
 // transformWrite: myTransformWriteFunction, //optional
  //transformRead: myTransformReadFunction, //optional
 // maxTries: 1 //optional, default 5
});
/*


Images.allow({
  insert: function() { return false; },
  update: function() { return false; },
  download: function() { return true; }
});
*/
