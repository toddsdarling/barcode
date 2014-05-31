AppRouter = Backbone.Router.extend({

	initialize:function() {

	},

	routes:{
		'':'lookUp',
		'displayBarCode':'display',
		'noMatch':'noMatch',
		'error':'error'
	},

	lookUp:function() {
		if (!BarCodeApp.lookUpView) {
			BarCodeApp.lookUpView = new LookupFormView();
		}
		BarCodeApp.lookUpView.render();
	},

	display:function() {
		if (!BarCodeApp.displayView) {
			BarCodeApp.displayView = new DisplayView();
		}
		BarCodeApp.displayView.render();
	},

	noMatch:function() {
		if (!BarCodeApp.noMatchView) {
			BarCodeApp.noMatchView = new NoMatchView();
		}
		BarCodeApp.noMatchView.render();
	}, 

	error:function() {
		if (!BarCodeApp.errorView) {
			BarCodeApp.errorView = new ErrorView();
		}
		BarCodeApp.errorView.render();		
	}

})