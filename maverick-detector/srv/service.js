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
  // 🔥 HELPER: Maverick Engine (FIXED + OPTIMIZED)
  //////////////////////////////////////////////////////////

  async function evaluateMaverick(tx, poID, skipHandler = false) {

    if (!poID) return

    const po = await tx.run(
      SELECT.one.from(PurchaseOrders)
        .where({ ID: poID })
        .columns(
          'ID', 'contract_ID',
          { vendor: ['preferredVendor'] },
          { items: ['ID', 'unitPrice', 'contractItem_ID'] }
        )
    )

    if (!po) return

    const reasons = new Set()
    let score = 0

    //////////////////////////////////////////////////////
    // 1️⃣ Vendor Check
    //////////////////////////////////////////////////////
    if (po.vendor?.preferredVendor === false) {
      reasons.add('NON_PREFERRED_VENDOR')
      score += 30
    }

    //////////////////////////////////////////////////////
    // 2️⃣ Contract Check
    //////////////////////////////////////////////////////
    if (!po.contract_ID) {
      reasons.add('NO_CONTRACT')
      score += 25
    }

    //////////////////////////////////////////////////////
    // 3️⃣ Batch Fetch Contract Items (NO N+1)
    //////////////////////////////////////////////////////
    const contractIDs = po.items
      ?.filter(i => i.contractItem_ID)
      .map(i => i.contractItem_ID)

    let contractMap = {}

    if (contractIDs?.length) {

      const rows = await tx.run(
        SELECT.from(ContractItems).where({ ID: contractIDs })
      )

      contractMap = Object.fromEntries(rows.map(r => [r.ID, r]))
    }

    //////////////////////////////////////////////////////
    // 4️⃣ Item Checks
    //////////////////////////////////////////////////////
    for (const item of po.items || []) {

      if (!item.contractItem_ID) {
        reasons.add('OFF_CATALOG_ITEM')
        score += 15
        continue
      }

      const contractItem = contractMap[item.contractItem_ID]

      if (contractItem && item.unitPrice > contractItem.unitPrice) {
        reasons.add('PRICE_VARIANCE')
        score += 20
      }
    }

    //////////////////////////////////////////////////////
    // Final Update (NO RECURSION)
    //////////////////////////////////////////////////////
    await tx.run(
      UPDATE(PurchaseOrders)
        .set({
          maverickFlag: reasons.size > 0,
          maverickScore: score,
          maverickReason_code: [...reasons].join(',')
        })
        .where({ ID: poID })
    )
  }


  //////////////////////////////////////////////////////////
  // 🧾 VENDORS HANDLERS
  //////////////////////////////////////////////////////////

  this.before(['CREATE', 'UPDATE'], Vendors, async (req) => {

    const d = req.data

    if (!d.vendorName)
      req.error('Vendor name is required')

    if (d.riskScore && d.riskScore > 100)
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


  //////////////////////////////////////////////////////////
  // Only Trigger From POItems (NO RECURSION NOW)
  //////////////////////////////////////////////////////////


  //////////////////////////////////////////////////////////
  // 📦 PO ITEMS HANDLERS
  //////////////////////////////////////////////////////////

  this.before(['CREATE', 'UPDATE'], POItems, async (req) => {

    const d = req.data

    if (d.quantity <= 0)
      req.error('Quantity must be greater than zero')

    if (d.unitPrice < 0)
      req.error('Unit price cannot be negative')

    if (d.quantity && d.unitPrice)
      d.totalAmount = d.quantity * d.unitPrice

  })


  this.after(['CREATE', 'UPDATE'], POItems, async (data, req) => {

    const tx = req.tx

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
    // Recalculate Maverick (SAFE)
    //////////////////////////////////////////////////////
    if (data.parent_ID)
      await evaluateMaverick(tx, data.parent_ID)

  })
  
})