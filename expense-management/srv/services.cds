using {sap.capire.expense as my } from '../db/schema';

service ExpensesService
{
    entity User as projection on my.User;
    @readonly
    entity Payments as projection on my.Payments;
    entity Budget as projection on my.Budget;
    entity Savings as projection on my.Savings;
    entity BudgetStatus as projection on my.BudgetStatus;
    entity PaymentModes   as projection on my.PaymentMode;
    entity PaymentTypes   as projection on my.PaymentType;
}