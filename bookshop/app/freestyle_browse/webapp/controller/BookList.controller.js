sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("my.bookshop.freestyle_browse.controller.BookList", {
        onInit: function() {
            // Initialization code here
        },

        onBookPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oRouter = this.getOwnerComponent().getRouter();
            var sBookId = oItem.getBindingContext().getProperty("ID");
            oRouter.navTo("RouteBookDetail", {
                bookId: sBookId
            });
        }
    });
});
