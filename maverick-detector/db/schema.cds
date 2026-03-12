namespace maverick.spend;

using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';

entity Vendors : cuid, managed 
{
  vendorName        : String(120);
  vendorCode        : String(40);
  vendorType        : Association to VendorType;
  taxNumber         : String(40);
  preferredVendor   : Boolean default false;
  country           : String(60);
  city              : String(60);
  addressLine1      : String(120);
  addressLine2      : String(120);
  postalCode        : String(20);
  contactPerson     : String(100);
  contactEmail      : String(100);
  contactPhone      : String(30);
  riskScore         : Decimal(5,2);
}

entity Contracts : cuid, managed 
{

  contractNumber        : String(50);
  title                 : String(150);
  description           : String(500);

  vendor                : Association to Vendors;
  contractStatus        : Association to ContractStatus;

  spendCategory         : Association to SpendCategory;

  startDate             : Date;
  endDate               : Date;
  renewalDate           : Date;

  contractValue         : Decimal(15,2);
  committedSpend        : Decimal(15,2);
  utilizedSpend         : Decimal(15,2);
  remainingValue        : Decimal(15,2);

  currency              : Association to Currency;

  paymentTerms          : String(80);
  incoterms             : String(40);

  pricingModel          : String(50);
  discountPercentage    : Decimal(5,2);

  minOrderValue         : Decimal(15,2);
  maxOrderValue         : Decimal(15,2);

  slaApplicable         : Boolean;
  penaltyClause         : Boolean;

  businessUnit          : String(80);
  department            : String(80);
  costCenter            : String(40);

  contractOwner         : String(100);
  approvalLevel         : String(40);

  autoRenewal           : Boolean;
  renewalNoticeDays     : Integer;

  complianceScore       : Decimal(5,2);

  items : Composition of many ContractItems
          on items.parent = $self;
}

entity ContractItems : cuid, managed 
{

  parent          : Association to Contracts;

  itemCode        : String(50);
  itemDescription : String(200);

  catalogItem     : Boolean;

  unitPrice       : Decimal(15,4);
  currency        : Association to Currency;

  minQty          : Decimal(15,3);
  maxQty          : Decimal(15,3);

  leadTimeDays    : Integer;

  taxPercentage   : Decimal(5,2);
  discountAllowed : Boolean;

}

entity PurchaseOrders : cuid, managed 
{

  poNumber            : String(50);
  title               : String(150);
  description         : String(500);

  vendor              : Association to Vendors;
  contract            : Association to Contracts;

  poStatus            : Association to POStatus;

  orderDate           : Date;
  deliveryDate        : Date;
  invoiceDate         : Date;

  spendCategory       : Association to SpendCategory;

  currency            : Association to Currency;

  grossAmount         : Decimal(15,2);
  netAmount           : Decimal(15,2);
  taxAmount           : Decimal(15,2);
  discountAmount      : Decimal(15,2);

  paymentTerms        : String(80);

  businessUnit        : String(80);
  department          : String(80);
  costCenter          : String(40);

  requesterName       : String(100);
  requesterEmail      : String(100);

  approverName        : String(100);
  approvalDate        : Date;

  isCatalogPurchase   : Boolean;
  isPreferredVendor   : Boolean;

  maverickFlag        : Boolean default false;
  maverickScore       : Decimal(5,2);
  maverickReason      : Association to MaverickReason;

  items : Composition of many POItems
          on items.parent = $self;
}

entity POItems : cuid, managed 
{

  parent          : Association to PurchaseOrders;

  itemCode        : String(50);
  itemDescription : String(200);

  quantity        : Decimal(15,3);
  unitPrice       : Decimal(15,4);

  contractItem    : Association to ContractItems;

  currency        : Association to Currency;

  taxPercentage   : Decimal(5,2);
  totalAmount     : Decimal(15,2);

  priceVariance   : Decimal(10,2);
  varianceFlag    : Boolean;

}
entity Currency : CodeList {
  key code : String(3);
}

entity VendorType : CodeList {
  key code : String(10);
}

entity SpendCategory : CodeList {
  key code : String(10);
}

entity ContractStatus : CodeList {
  key code : String(10);
}

entity POStatus : CodeList {
  key code : String(10);
}

entity MaverickReason : CodeList {
  key code : String(20);
}
  // "i18n": {
      //   "type": "sap.ui.model.resource.ResourceModel",
      //   "settings": {
      //     "bundleName": "maverickdetection.i18n.i18n"
      //   }
      // },