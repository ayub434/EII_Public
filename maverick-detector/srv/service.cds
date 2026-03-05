using {maverick.spend as db} from '../db/schema';

service maverrickService
{
    entity Vendors as projection on db.Vendors;
    entity Contracts as projection on db.Contracts;
    entity ContractItems as projection on db.ContractItems;
    entity PurchaseOrders as projection on db.PurchaseOrders;
    entity POItems as projection on db.POItems;
}