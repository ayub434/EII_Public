sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], (BaseController, History) => {
  "use strict";

  return BaseController.extend("maverickdetection.controller.MaverickDetection", {

    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      this._oRoute = oRouter.getRoute("detail");
      this._oRoute.attachPatternMatched(this._onMatched, this);
    },

    _onMatched: function (oEvent) {
      const sID = oEvent.getParameter("arguments").id;

      // Guard: if ID is missing or invalid, navigate back to dashboard
      if (!sID) {
        console.warn("MaverickDetection: No ID in route arguments");
        this.getOwnerComponent().getRouter()
          .navTo("RouteMaverickDetection", {}, true);
        return;
      }

      this.getView().bindElement({
        path: `/PurchaseOrders(${sID})`,
        parameters: {
          $expand: "items($expand=contractItem),vendor"
        },
        events: {
          bindingContextAvailable: function () {
            const oContext = this.getView().getBindingContext();
            if (!oContext || !oContext.getObject()) {
              console.warn("MaverickDetection: No data found for ID", sID);
            }
          }.bind(this),
          dataReceived: function (oData) {
            if (!oData.getParameter("data")) {
              console.warn("MaverickDetection: Empty data received for ID", sID);
            }
          }.bind(this)
        }
      });
    },

    onNavBack: function () {
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        // No history — go directly to dashboard
        this.getOwnerComponent().getRouter()
          .navTo("RouteMaverickDetection", {}, true);
      }
    },

    onExit: function () {
      // Detach route listener to prevent stacking multiple listeners
      if (this._oRoute) {
        this._oRoute.detachPatternMatched(this._onMatched, this);
      }
    }

  });
});