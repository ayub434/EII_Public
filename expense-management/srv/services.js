const cds = require('@sap/cds');


module.exports = class ExpenseService extends cds.ApplicationService { init() {

  const { User, Payments, Budget, BudgetStatus, Savings, PaymentModes, PaymentTypes } = cds.entities('ExpenseService')

  this.on("READ",User, async(req) => {
    const tx = this.tx(req);
    if(req.data?.ID)
    {
      return tx.run(SELECT.one.from(User).where({ID:req.data.ID}));
    }
    if(req.data?.email)
    {
      return tx.run(SELECT.one.from(User).where({email:req.data.email}));
    }
    return tx.run(SELECT.from(User));
  });

  this.after("READ",User,async() =>{
    console.log("nitish is a tall guy" );
  });
  // this.after("READ", User, (data) => {
  //     if (!data) return;
  //     const rows = Array.isArray(data) ? data : [data];
  //     rows.forEach(u => {
  //       u.fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  //     });
  //   });

  return super.init()
}}
