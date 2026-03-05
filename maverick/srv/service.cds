
using { maverick.spend.detection as db } from '../db/schema';

service maverickService  {

    entity Vendors as projection on db.Vendors;
    entity Expenses as projection on db.Expenses;
    entity Alerts as projection on db.Alerts;
    entity Accounts as projection on db.Accounts;
    entity ExpenseOverview as projection on db.ExpensesOverview;

    action detectAnomalies(thresholdPercent : Integer default 50) returns array of Expenses;

    action markExpenseReviewed(expenseId : UUID) returns Boolean;

    action bulkApprove(expenseIds : array of UUID) returns Integer; 

    function riskScore(expenseId : UUID) returns Decimal(5,2);

    action purgeOldAlerts(olderThanDays : Integer) returns Integer;
}
