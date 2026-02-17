using { cuid, managed,sap.common.CodeList } from '@sap/cds/common';
namespace sap.capire.core;

entity Companies : cuid,managed {
    code:String(20);
    name:String(100);
    domain:String(100);
    active:Boolean default true;    
}

entity Departments : cuid,managed {
    name:String(50);
    company:Association to Companies;
}

entity Designations : cuid,managed {
    title:String(100); //job title
    level:Association to Levels;  
}

entity Levels : CodeList {
    Key code:String(20) enum{
        Intern= 'INTERN';
        Junior='JUNIOR';
        Senior='SENIOR';
        TeamLead= 'TEAMLEAD';
        Manager= 'MANAGER';
        Director='DIRECTOR';
        C_Suite='C-SUITE';
    }
}

entity Users : cuid,managed {
    userName:String(100);
    email:String(20);
    phone:String(20);
    company:Association to Companies;
    department:Association to Departments;
    designation:Association to Designations;
    active:Boolean default true;
    lastLogin:Timestamp;
} 

entity Roles : cuid {
    code:String(50); //ex..Admin,sales
    name:String(100); //rolename
    Description:String(255);
}

entity Permissions : cuid {
    resource:String(50); //entity/module
    action:String(100); //create,update,delete
}

entity RolePermission : cuid {
    role:Association to Roles;
    permission:Association to Permissions;
}

entity UserRoles : cuid {
    user:Association to Users;
    role:Association to Roles;
}

entity ApprovalFlows : cuid,managed {
    module:String(50);
    entityName:String(70);
    enable:String enum{ OPEN;CLOSED}    
}

entity Approvals : cuid,managed {
    referenceID:String(30);
    approver:Association to Users;
    status:Association to Status;
    comment:LargeString;
}

entity Status : CodeList {
    key code:String(10) enum{
        pending='PENDING';
        approved='APPROVED';
        rejected='REJECTED';
    }
}

entity Notification : cuid,managed {
    users:Association to Users;
    title:String(100);
    message:String(225);
    read:Boolean default false;
}

entity SystemSettings : cuid {
    settingName:String(100);
    value:String(50);
    module:String(100);    
}

entity Attachments : cuid,managed {
    fileName:String(100);
    fileType:String(50);
    filesize:Integer;
    uploadedBy:Association to Users;
}

entity AuditLogs : cuid,managed {
    entityName:String(100);
    recordID:String(30);
    action:String(20);
    changedBy:Association to Users;
    oldValue:LargeString;
    newValue:LargeString;
}