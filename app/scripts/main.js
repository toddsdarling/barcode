/*global BarCodeApp, $*/
window.BarCodeApp = {    
    init: function () {
        'use strict';        
        this.barCode = new BarCode();
        this.appRouter = new AppRouter();
        Backbone.history.stop();
        Backbone.history.start();

        //check if model already has data in it
        if (this.barCode.get('barCodeImageString') == '') {
            //go to new lookup form if no data
            this.appRouter.navigate('',{trigger:true});
        } else {
            //if you already have the barcode, then navigate to the display view
            this.appRouter.navigate('displayBarCode',{trigger:true});
        }
    }
};

$(document).ready(function () {
    //init foundation framework
   $(document).foundation();
    BarCodeApp.init();
});


