const cds = require('@sap/cds')

module.exports = cds.service.impl(async function () {

  const {
    Vendors,
    Contracts,
    ContractItems,
    PurchaseOrders,
    POItems
  } = this.entities


  //////////////////////////////////////////////////////////
  // 🔥 HELPER: Maverick Engine (Core Logic)
  //////////////////////////////////////////////////////////

  async function evaluateMaverick(tx, poID) {

    const po = await tx.run(
      SELECT.one.from(PurchaseOrders)
        .where({ ID: poID })
        .columns(
          '*',
          { vendor: ['preferredVendor'] },
          { items: ['ID', 'unitPrice', 'quantity', 'contractItem_ID'] }
        )
    )

    if (!po) return

    let reasons = []
    let score = 0

    //////////////////////////////////////////////////////
    // 1️⃣ Vendor Check
    //////////////////////////////////////////////////////
    if (po.vendor && po.vendor.preferredVendor === false) {
      reasons.push('NON_PREFERRED_VENDOR')
      score += 30
    }

    //////////////////////////////////////////////////////
    // 2️⃣ Contract Check
    //////////////////////////////////////////////////////
    if (!po.contract_ID) {
      reasons.push('NO_CONTRACT')
      score += 25
    }

    //////////////////////////////////////////////////////
    // 3️⃣ Item Level Checks
    //////////////////////////////////////////////////////
    for (const item of po.items || []) {

      if (!item.contractItem_ID) {
        reasons.push('OFF_CATALOG_ITEM')
        score += 15
        continue
      }

      const contractItem = await tx.run(
        SELECT.one.from(ContractItems)
          .where({ ID: item.contractItem_ID })
          .columns('unitPrice')
      )

      if (contractItem && item.unitPrice > contractItem.unitPrice) {
        reasons.push('PRICE_VARIANCE')
        score += 20
      }
    }

    //////////////////////////////////////////////////////
    // Final Update
    //////////////////////////////////////////////////////
    await tx.run(
      UPDATE(PurchaseOrders)
        .set({
          maverickFlag: reasons.length > 0,
          maverickScore: score,
          maverickReason_code: reasons[0] || null
        })
        .where({ ID: poID })
    )
  }


  //////////////////////////////////////////////////////////
  // 🧾 VENDORS HANDLERS
  //////////////////////////////////////////////////////////

  this.before(['CREATE', 'UPDATE'], Vendors, async (req) => {

    const data = req.data

    if (!data.vendorName)
      req.error('Vendor name is required')

    if (data.riskScore && data.riskScore > 100)
      req.error('Risk score cannot exceed 100')

  })


  //////////////////////////////////////////////////////////
  // 📄 CONTRACT HANDLERS
  //////////////////////////////////////////////////////////

  this.before(['CREATE', 'UPDATE'], Contracts, async (req) => {

    const d = req.data

    if (d.startDate && d.endDate && d.startDate > d.endDate)
      req.error('Contract start date cannot be after end date')

    if (d.contractValue && d.contractValue < 0)
      req.error('Contract value cannot be negative')

  })


  //////////////////////////////////////////////////////////
  // 📦 CONTRACT ITEMS HANDLERS
  //////////////////////////////////////////////////////////

  this.before(['CREATE', 'UPDATE'], ContractItems, async (req) => {

    const d = req.data

    if (d.minQty && d.maxQty && d.minQty > d.maxQty)
      req.error('minQty cannot exceed maxQty')

    if (d.unitPrice < 0)
      req.error('unitPrice cannot be negative')

  })


  //////////////////////////////////////////////////////////
  // 🧾 PURCHASE ORDER HANDLERS
  //////////////////////////////////////////////////////////

  this.before(['CREATE', 'UPDATE'], PurchaseOrders, async (req) => {

    const d = req.data

    if (d.netAmount && d.grossAmount && d.netAmount > d.grossAmount)
      req.error('Net amount cannot exceed gross amount')

    if (d.orderDate && d.deliveryDate && d.deliveryDate < d.orderDate)
      req.error('Delivery date cannot be before order date')

  })


  this.after(['CREATE', 'UPDATE'], PurchaseOrders, async (data, req) => {

    const tx = cds.transaction(req)
    await evaluateMaverick(tx, data.ID)

  })


  //////////////////////////////////////////////////////////
  // 📦 PO ITEMS HANDLERS
  //////////////////////////////////////////////////////////

  this.before(['CREATE', 'UPDATE'], POItems, async (req) => {

    const d = req.data

    if (d.quantity <= 0)
      req.error('Quantity must be greater than zero')

    if (d.unitPrice < 0)
      req.error('Unit price cannot be negative')

    //////////////////////////////////////////////////////
    // Auto-calc total
    //////////////////////////////////////////////////////
    if (d.quantity && d.unitPrice)
      d.totalAmount = d.quantity * d.unitPrice

  })


  this.after(['CREATE', 'UPDATE'], POItems, async (data, req) => {

    const tx = cds.transaction(req)

    //////////////////////////////////////////////////////
    // Price Variance Auto-Calc
    //////////////////////////////////////////////////////
    if (data.contractItem_ID) {

      const contractItem = await tx.run(
        SELECT.one.from(ContractItems)
          .where({ ID: data.contractItem_ID })
          .columns('unitPrice')
      )

      if (contractItem) {

        const variance = data.unitPrice - contractItem.unitPrice

        await tx.run(
          UPDATE(POItems)
            .set({
              priceVariance: variance,
              varianceFlag: variance > 0
            })
            .where({ ID: data.ID })
        )
      }
    }

    //////////////////////////////////////////////////////
    // Recalculate Maverick
    //////////////////////////////////////////////////////
    await evaluateMaverick(tx, data.parent_ID)

  })


})