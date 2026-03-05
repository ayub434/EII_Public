const cds = require('@sap/cds')

module.exports = async function () {

  const {
    Expenses,
    Vendors,
    Alerts,
    Contracts,
    PurchaseOrders,
    PurchaseOrderItems,
    Materials
  } = this.entities


  /* =====================================================
     1️⃣ Detect Anomalies
     ===================================================== */
  this.on('detectAnomalies', async (req) => {

    const { thresholdPercent = 50 } = req.data
    const tx = cds.tx(req)

    const expenses = await tx.run(
      SELECT.from(Expenses)
        .columns('*', { vendor: ['isPreferred'] })
    )

    const flaggedExpenses = []

    for (const exp of expenses) {

      let isAnomaly = false
      let severity = 'LOW'
      let message = ''

      /* ---------------------------
         Rule 1: Non-preferred vendor
         --------------------------- */
      if (exp.vendor && exp.vendor.isPreferred === false) {
        isAnomaly = true
        severity = 'MEDIUM'
        message = 'Expense created with non-preferred vendor'
      }

      /* ---------------------------
         Rule 2: Abnormally high amount
         --------------------------- */
      if (exp.amount > thresholdPercent * 1000) {
        isAnomaly = true
        severity = 'HIGH'
        message = 'Expense exceeds risk threshold'
      }

      if (isAnomaly) {
        await tx.run(
          INSERT.into(Alerts).entries({
            expense_ID: exp.ID,
            type: 'ANOMALY',
            severity,
            message,
            createdAt: new Date(),
            resolved: false
          })
        )
        flaggedExpenses.push(exp)
      }
    }

    return flaggedExpenses
  })


  /* =====================================================
     2️⃣ Mark Expense Reviewed
     ===================================================== */
  this.on('markExpenseReviewed', async (req) => {

    const { expenseId } = req.data
    const tx = cds.tx(req)

    await tx.run(
      UPDATE(Alerts)
        .set({ resolved: true })
        .where({ expense_ID: expenseId })
    )

    return true
  })


  /* =====================================================
     3️⃣ Bulk Approve Expenses
     ===================================================== */
  this.on('bulkApprove', async (req) => {

    const { expenseIds } = req.data
    const tx = cds.tx(req)

    const result = await tx.run(
      UPDATE(Expenses)
        .set({ status: 'APPROVED' })
        .where({ ID: { in: expenseIds } })
    )

    return result
  })


  /* =====================================================
     4️⃣ Risk Score Calculation
     ===================================================== */
  this.on('riskScore', async (req) => {

    const { expenseId } = req.data
    const tx = cds.tx(req)

    const expense = await tx.run(
      SELECT.one.from(Expenses)
        .where({ ID: expenseId })
        .columns('*', { vendor: ['isPreferred'] })
    )

    if (!expense) return 0

    let score = 0

    // High amount increases risk
    if (expense.amount > 10000) score += 40

    // Non-preferred vendor increases risk
    if (expense.vendor && expense.vendor.isPreferred === false) {
      score += 30
    }

    // Pending expenses increase risk
    if (expense.status === 'PENDING') score += 20

    // Max score 100
    return Math.min(score, 100)
  })


  /* =====================================================
     5️⃣ Purge Old Alerts
     ===================================================== */
  this.on('purgeOldAlerts', async (req) => {

    const { olderThanDays } = req.data
    const tx = cds.tx(req)

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - olderThanDays)

    const deleted = await tx.run(
      DELETE.from(Alerts)
        .where({ createdAt: { '<': cutoff } })
    )

    return deleted
  })

}