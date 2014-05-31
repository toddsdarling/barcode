LookupFormView = Backbone.View.extend({

	initialize:function() {
		this.el = "#content";
		this.model = BarCodeApp.barCode;
	},

	render:function() {
		//stash a reference to the view
		this.model.view = this;

		//listen for status changes from the model
		this.model.on('statusChange',this.updateFromModel);

		//ref to this view
       	var thisView = this;
       	var modelData = BarCodeApp.barCode.toJSON();

        //Fetching the template contents
        $.get('templates/lookup.html', function (data) {
            thisView.template = _.template(data, {fname:modelData.fname,lname:modelData.lname,dobMonth:modelData.dobMonth,dobDay:modelData.dobDay,dobYear:modelData.dobYear});//Option to pass any dynamic values to template            
	        $(thisView.el).html(thisView.template);			

	        //set up the action for the form button
	        $('input#lookUpBtn').click(function(e){
	        	e.preventDefault();		       	
	        	thisView.model.validateData(thisView,$(thisView.el).find('#lookUpForm').serializeArray());

	        });
	        //call foundation reflow to pick up new elements
	        $(document).foundation('reflow');

			$(thisView.el).fadeIn(200);

        }, 'html');
	},

	showErrors:function(errorArray) {

		//trigger modal error message
		$('#errorModal').foundation('reveal', 'open');
		//set the auto-close
		$('#errorModal').bind('opened', function() {
				setTimeout(function() {
					$('#errorModal').foundation('reveal','close');
				},2200);
		})

		$('#errorModal').bind('closed', function() {
			$('#errorModal').unbind();
		})

		$('#lookUpForm label').removeClass('error');

		//loop through the error messages, outlining each form field in red.
		$.each(errorArray,function(errorIndex,errorValue) {
			if (!$('label[for='+errorValue.name+']').hasClass('error')) {
				$('label[for='+errorValue.name+']').addClass('error');	
			}

			if (errorValue.name == 'dobYear' || errorValue.name == 'dobDay' || errorValue.name == 'dobMonth') {
				$('label[for=dob]').addClass('error');		
			}			
		});

	},

	formComplete:function() {
		//clear all the errors
		$('#lookUpForm label').removeClass('error');
	},

	showProgress:function() {
		//trigger modal progress message
		$('#progressModal').foundation('reveal', 'open');
	},

	updateFromModel:function(e) {
		var modelStatus = this.get('status');

		//close progress message
		$('#progressModal').foundation('reveal', 'close');

		switch (modelStatus) {
			//the multiple match view will trigger the same event as the no match view
			//so there's really only two cases here
			case 'singleMatch':
				$(this.view.el).fadeOut(200,function() {
					BarCodeApp.appRouter.navigate('displayBarCode',{trigger:true});	
				});
				break;
			case 'noMatch':
				//navigate to no match view if no matches found
				$(this.view.el).fadeOut(200,function() {
					BarCodeApp.appRouter.navigate('noMatch',{trigger:true});	
				});
				break;
			case 'connectionError':
				//navigate to no connection or F1 view if you get an error back from F1
				$(this.view.el).fadeOut(200,function() {
					BarCodeApp.appRouter.navigate('error',{trigger:true});	
				});
				break;				
		}
	}
});


DisplayView = Backbone.View.extend({

	events:{
		"click .resetLink": "callReset"
	},	

	initialize:function() {
		this.el = "#content";
		//this is the magic that makes sure our click event fires
		this._ensureElement();		
		this.model = BarCodeApp.barCode; 
	},

	render:function() {
		this.model.view = this;

		//ref to this view
       	var thisView = this;

        //Fetching the template contents
        $.get('templates/display.html', function (data) {
            
            thisView.template = _.template(data);
            $(thisView.el).hide();	                  
	        $(thisView.el).html(thisView.template);

	        thisView.displayBarCode();
	        
        }, 'html');
	},

	displayBarCode:function() {

		//either display the image from local storage OR pull image from web
		var barCodeImageString = this.model.get('barCodeImageString');
		var thisView = this;

		//create image from local storage
		$('img#barCodeImg').attr('src',barCodeImageString);
		$(thisView.el).fadeIn(200);		

	},

	callReset:function(e) {
		e.preventDefault();
		thisView = this;
		//trigger the reset app event that the model listens for				
		$(this.el).fadeOut(200,function() {
			thisView.model.trigger("resetApp");		
		});		
			
	}	

});

NoMatchView = Backbone.View.extend({
	//listen for the click event on the reset link
	events:{
		"click .resetLink": "callReset"
	},

	initialize:function() {
		this.el = "#content";
		//this is the magic that makes sure our click event fires
		this._ensureElement();
		this.model = BarCodeApp.barCode; 
	},

	render:function() {
		this.model.view = this;

		//ref to this view
       	var thisView = this;

        //Fetching the template contents
        $.get('templates/nomatch.html', function (data) {	            
            thisView.template = _.template(data);//Option to pass any dynamic values to template
            //$(thisView.el).hide();	                  
	        $(thisView.el).html(thisView.template);		   
	        $(thisView.el).fadeIn(200);
        }, 'html');
	},

	callReset:function(e) {
		e.preventDefault();
		thisView = this;
		//trigger the reset app event that the model listens for				
		$(this.el).fadeOut(200,function() {
			thisView.model.trigger("resetApp");		
		});		
			
	}	

});

ErrorView = Backbone.View.extend({
	//listen for the click event on the reset link
	events:{
		"click .resetLink": "callReset"
	},

	initialize:function() {
		this.el = "#content";
		//this is the magic that makes sure our click event fires
		this._ensureElement();
		this.model = BarCodeApp.barCode; 
	},

	render:function() {
		this.model.view = this;

		//ref to this view
       	var thisView = this;

		//close any progress messages
		$('#progressModal').foundation('reveal', 'close');       	

        //Fetching the template contents
        $.get('templates/error.html', function (data) {	            
            thisView.template = _.template(data);//Option to pass any dynamic values to template
            //$(thisView.el).hide();	                  
	        $(thisView.el).html(thisView.template);		   
	        $(thisView.el).fadeIn(200);
        }, 'html');
	},

	callReset:function(e) {
		e.preventDefault();
		thisView = this;
		//trigger the reset app event that the model listens for				
		$(this.el).fadeOut(200,function() {
			thisView.model.trigger("resetApp");		
		});		
			
	}	

});


