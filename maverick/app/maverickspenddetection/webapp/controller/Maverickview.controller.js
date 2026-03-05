// sap.ui.define([
//   "sap/ui/core/mvc/Controller",
//   "sap/m/MessageToast",
//   "sap/m/MessageBox"
// ], function (Controller, MessageToast, MessageBox) {

//   return Controller.extend("maverick.app.controller.Main", {

//     onDetect: async function () {

//       const oModel = this.getView().getModel()

//       try {
//         await oModel.bindContext("/detectAnomalies(...)")
//           .setParameter("thresholdPercent", 50)
//           .execute()

//         MessageToast.show("Anomaly detection completed")
//         oModel.refresh()

//       } catch (err) {
//         MessageBox.error(err.message)
//       }
//     },

//     onBulkApprove: async function () {

//       const oTable = this.byId("expenseTable")
//       const aContexts = oTable.getSelectedContexts()

//       if (!aContexts.length) {
//         MessageToast.show("Select expenses first")
//         return
//       }

//       const ids = aContexts.map(c => c.getObject().ID)

//       const oModel = this.getView().getModel()

//       await oModel.bindContext("/bulkApprove(...)")
//         .setParameter("expenseIds", ids)
//         .execute()

//       MessageToast.show("Expenses approved")
//       oModel.refresh()
//     },

//     onRiskScore: async function (oEvent) {

//       const oContext = oEvent.getSource().getBindingContext()
//       const expenseId = oContext.getObject().ID

//       const oModel = this.getView().getModel()

//       const action = oModel.bindContext("/riskScore(...)")
//       action.setParameter("expenseId", expenseId)

//       const result = await action.execute()
//       const score = result.getObject()

//       MessageBox.information("Risk Score: " + score)
//     }

//   })
// })