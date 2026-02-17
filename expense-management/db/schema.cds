using{cuid, managed, sap.common.CodeList} from '@sap/cds/common';

namespace sap.capire.expense;

entity User : cuid 
{
    firstName : String(30);
    lastName  : String(30);
    name      : String = trim (firstName || ' ' || lastName);
    email     : String(50);
    phnno     : String(10);
    payments  : Association to many Payments on payments.users = $self;
    budgets   : Composition of many Budget on budgets.users = $self;
    savings   : Association to many Savings on savings.users = $self;
    
}

entity Payments : managed
{
    key Id : String(5);
    amount : Decimal(15,2);
    budget : Association to Budget;
    users  : Association to User;
}

entity Budget : cuid, managed
{
    amount      : Decimal(15,2);
    usedAmount  : Decimal(15,2);
    balance     : Decimal (15,2);
    status      : Association to BudgetStatus ;
    users       : Association to User;
    payments    : Composition of many Payments on payments.budget=$self;
}

entity Savings : cuid, managed 
{

  goalName     : String(100);
  targetAmount : Decimal(15,2);
  savedAmount  : Decimal(15,2) default 0;
  targetDate   : Date;
  users        : Association to User;
}

entity PaymentMode : CodeList 
{
  key code : String enum
  {
    CASH = 'cash';
    UPI  = 'upi';
    CARD = 'card';
    NET  = 'net_banking';
  };   
}

entity BudgetStatus : CodeList {
    key code:String enum
    {
        ACTIVE   = 'ac';
        CLOSED   = 'close';
        EXCEEDED = 'exceed';
    };
}

entity PaymentType : CodeList
{
    key code : String(10);
    name     : localized String(50);
    desc     : localized String(200);
}

