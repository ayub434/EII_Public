using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';

namespace maverick.spend.detection;

entity Vendors : cuid, managed {
  name            : String(100);
  vendorCode      : String(30);
  email           : String(100);
  country         : String(50);
  city            : String(50);
  isPreferred     : Boolean default false;
}

entity Expenses : cuid, managed {
  vendor         : Association to Vendors;
  account        : Association to Accounts;
  amount         : Decimal(15,2);
  currency       : String(3);
  date           : Date;
  status         : String(30); // e.g. PENDING, APPROVED, REJECTED
  description    : String(255);
}

entity Alerts : cuid, managed {
  expense        : Association to Expenses;
  type           : String(50);
  severity       : String(10);
  message        : String(255);
  createdAt      : Timestamp;
  resolved       : Boolean default false;
}

entity Accounts : cuid, managed {
  name           : String(100);
  number         : String(30);
  owner          : String(100);
  type           : String(30);
}

entity ExpensesOverview : cuid {
  amount         : Decimal(15,2);
  currency       : String(3);
  date           : Date;
  vendor         : Association to Vendors;
  status         : String(30);
}

entity Materials : cuid, managed {
  materialCode    : String(40);
  name            : String(100);
  description     : String(255);
  category        : String(100);
  uom             : String(10);
  isCatalogItem   : Boolean default true;
  catalogPrice    : Decimal(13,2);
}

entity Contracts : cuid, managed {
  contractNumber     : String(40);
  vendor             : Association to Vendors;
  material           : Association to Materials;

  contractedPrice    : Decimal(13,2);
  currency           : String(3);

  validFrom          : Date;
  validTo            : Date;
  status             : String(30);   // ACTIVE / EXPIRED
}

entity PurchaseOrders : cuid, managed {

  /* Basic Info */
  poNumber          : String(40);
  vendor            : Association to Vendors;

  /* Buyer & Org Info */
  buyerName         : String(100);
  buyerEmail        : String(100);
  department        : String(100);
  companyCode       : String(10);
  purchasingOrg     : String(10);

  /* Financial Info */
  totalAmount       : Decimal(15,2);
  currency          : String(3);
  taxAmount         : Decimal(15,2);
  discountAmount    : Decimal(15,2);

  /* Status & Dates */
  status            : String(30);   // DRAFT / APPROVED / REJECTED
  poDate            : Date;
  deliveryDate      : Date;
  approvalDate      : Date;

  /* Control Fields */
  paymentTerms      : String(100);
  approvalLimit     : Decimal(15,2);
}

entity PurchaseOrderItems : cuid, managed {

  po                : Association to PurchaseOrders;
  material          : Association to Materials;
  contract          : Association to Contracts;

  itemNumber        : Integer;
  description       : String(255);

  quantity          : Decimal(13,3);
  uom               : String(10);

  unitPrice         : Decimal(13,2);
  netAmount         : Decimal(15,2);
  taxAmount         : Decimal(15,2);

  deliveryDate      : Date;
}



entity MaverickIssueTypes : CodeList {
  key code : String(30);
  text     : String(100);
}
/*
  PRICE_DEVIATION
  NON_PREFERRED_VENDOR
  OFF_CATALOG
*/

entity SeverityLevels : CodeList {
  key code : String(10);
  text     : String(50);
}
/*
  LOW
  MEDIUM
  HIGH
*/

/* =====================================================
   Maverick Spend Findings
   ===================================================== */

entity MaverickFindings : cuid, managed {

  po                : Association to PurchaseOrders;
  poItem            : Association to PurchaseOrderItems;
  vendor            : Association to Vendors;

  issueType         : Association to MaverickIssueTypes;
  severity          : Association to SeverityLevels;

  deviationAmount   : Decimal(13,2);
  deviationPercent  : Decimal(5,2);

  detectedAt        : Timestamp;
  comments          : String(255);
}