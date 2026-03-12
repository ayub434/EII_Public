sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], (BaseController, Filter, FilterOperator) => {
  "use strict";

  return BaseController.extend("maverickdetection.controller.App", {

    // Track both filters independently so they can be combined
    _sSearchValue: "",
    _bMaverickOnly: false,

    onInit: function () {
      // Model is auto-created by manifest.json — no manual ODataModel needed
    },

    onSearch: function (oEvent) {
      this._sSearchValue = oEvent.getParameter("newValue") || "";
      this._applyFilters();
    },

    onMaverickFilter: function (oEvent) {
      this._bMaverickOnly = oEvent.getParameter("selected");
      this._applyFilters();
    },

    _applyFilters: function () {
      const oTable = this.byId("poTable");
      const oBinding = oTable.getBinding("items");
      const aFilters = [];

      // Search filter — only apply if value is not empty
      if (this._sSearchValue) {
        aFilters.push(new Filter(
          "poNumber",
          FilterOperator.Contains,
          this._sSearchValue
        ));
      }

      // Maverick flag filter
      if (this._bMaverickOnly) {
        aFilters.push(new Filter(
          "maverickFlag",
          FilterOperator.EQ,
          true
        ));
      }

      // AND logic: both filters active at the same time
      oBinding.filter(
        aFilters.length > 0
          ? new Filter({ filters: aFilters, and: true })
          : []
      );
    },

    onSelectPO: function (oEvent) {
      const oItem = oEvent.getSource();
      const oContext = oItem.getBindingContext();

      if (!oContext) {
        return;
      }

      const sID = oContext.getProperty("ID");

      if (!sID) {
        console.warn("PO ID not found on binding context");
        return;
      }

      this.getOwnerComponent().getRouter()
        .navTo("detail", { id: sID });
    }

  });
});