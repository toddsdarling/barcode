BarCode = Backbone.Model.extend ({

	defaults: {
		fname:'',
		lname:'',
		personID:'',
		dobMonth:'',
		dobDay:'',
		dobYear:'',
		barCode:'',
		imgPath:'',
		barCodeImageString:'',
		status:'',		
	},

initialize: function() {
	
	try {
		var modelFromStorage = JSON.parse(localStorage.getItem('hcc-barCode'));
		if (modelFromStorage) {
			for (var key in modelFromStorage) {
				if (modelFromStorage.hasOwnProperty(key)) {
					this.attributes[key] = modelFromStorage[key];
				}
			}
		}

	} catch (e) {
		//no local storage defined.
		
	}

	//this.on("change:barCodeImageString", this.saveData);
	//this.bind('resetApp',this.resetApp);
	this.on('setBarCodeString',this.saveImageString);
	this.on('resetApp', this.resetApp);


},

validateData:function(whichView,formArray) {

	var requiredValues = ['fname','lname','dobMonth','dobDay','dobYear'];

	var errors = [];

	var thisModel = this;

	//this function accepts an array of objects with the form names and values
	$.each(formArray,function(formIndex,formObj){

		if (requiredValues.indexOf(formObj.name) > -1) {
			//if the value is blank, push the object onto the array
			if (formObj.value == '') {
				errors.push(formObj);
			} else {
				//update the modal
				thisModel.set(formObj.name,formObj.value);
			}
		}

		//double check to make sure they entered a 4 digit year
		if (formObj.name == 'dobYear') {
			if (formObj.value.length < 4) {
				errors.push(formObj);
			}
		}

	});

	if (errors.length > 0) {
		//update the view
		whichView.showErrors(errors);
	} else {
		//clear errors
		whichView.formComplete();
		//show the progress window
		whichView.showProgress();
		//format the data to send	
		var formData = {fname: thisModel.get('fname'), lname: thisModel.get('lname'), dob: thisModel.get('dobMonth')+'/'+thisModel.get('dobDay')+'/'+thisModel.get('dobYear'), method:'findBarCode'};
		//send it on
		$.ajax({
			url:"lib/controller.php",
			type:"POST",
			data:formData,
			context:this,
			success:this.lookUpSuccess,
			error:this.lookUpError,
			dataType:"json"					
		});
	}

},

lookUpSuccess:function(data,textStatus,obj) {

	var result = $.parseJSON(obj.responseText);

	switch (data.action) {
		case 'singleMatch':
			//found the single person, update the model and display their barcode
			this.set('personID',data.personID);
			this.set('barCode',data.barCode);
			this.set('barCodeImageString',data.imgString);
			this.set('status','singleMatch');
			//save this to local storage
			this.saveData();
		break;

		case 'noMatch':
			//set the status, which will trigger the view to update
			this.set('status','noMatch');
		break;
		case 'multipleMatch':
			//multiple matches get the noMatch status, since the actions are the same
			this.set('status','noMatch');
		break;
		case 'f1Error':
			//if an F1 Error occurs, show connection error view
			this.set('status','connectionError');
		break;
	}

	this.trigger('statusChange');

},

saveData:function(data) {

	try{
		localStorage.setItem('hcc-barCode',JSON.stringify(this));
	} catch (e){
		//no local storage
	}

},

saveImageString:function(data) {
	this.set('barCodeImageString',data.imgString);
	this.saveData();
},

resetApp:function() {
	try {		
	//remove everything from local storage
	localStorage.removeItem('hcc-barCode');
	} catch(e) {

	}

	//call init function on main app
	window.BarCodeApp.init();
}

});