using {cuid, managed, sap.common.CodeList} from '@sap/cds/common';

namespace TrainingManagementSystem;

entity Employees : cuid ,managed
{
    employeeID   : String(20);
    fullName     : String(50);
    email        : String(30);
    phonenumber  : String(10);
    jobRole      : String(100);
    department   : Association to Departments;
    location     : Association to Locations;
    lineManager  : Association to Employees;
    status       : String(20);
}

entity TrainingModules : cuid, managed
{
    title              : String(200);
    description        : String(2000);
    trainingType       : Association to TrainingTypes;
    durationMins       : Integer;
    provider           : String(100);
    isMandtory         : Boolean default false;
    tmsProvider        : String(50);
    tmsCourseID        : String(20);
    validMonths        : Integer;
    complaince         : String(80);
}

entity TrainingSessions : cuid, managed
{
    module              : Association to TrainingModules;
    enrollments         : Composition of many SessionEnrollments on enrollments.session = $self;
    sessionTitle        : String(100);
    trainerName         : String(30);
    sessionTopic        : String(100);
    startDate           : Timestamp;
    startTime           : Integer;
    endDate             : Timestamp;
    endTime             : Integer;
    location            : String(150);
    capacity            : Integer;
    status              : String(30);
}

entity SessionEnrollments : cuid,managed
{
    session               : Association to TrainingSessions;
    employee              : Association to Employees;
    attendance            : String(20);
    enrolledDate          : Timestamp;
}

entity LearningRoadmap : cuid,managed
{
    code               : String(30);
    title              : String(160);
    description        : String(500);
    modules            : Composition of many LearningRoadmapModules on modules.roadmap = $self;
}

entity LearningRoadmapModules : cuid,managed
{
    roadmap                   : Association to LearningRoadmap;
    module                    : Association to TrainingModules;
    sequenece                 : Integer;
    isRequired                : Boolean default true;

}

entity ModuleAssignments  : cuid,managed 
{
    employee              : Association to Employees;
    module                : Association to TrainingModules;
    assignedBy            : String(50);
    assignedToType        : String(20); 
    assignedToValue       : String(120);
    assignedDate          : Date;
    dueDate               : Date;
    status                : Association to AssignmentStatus;
    priority              : Association to PriorityLevels;
    source                : String(20); 
    completion            : Composition of one CompletionPerformanceRecords on completion.assignment = $self;
}

entity CompletionPerformanceRecords : cuid, managed 
{
  assignment                        : Association to ModuleAssignments;
  completionDate                    : Date;
  status                            : Association to CompletionStatus;
  score                             : Decimal(5,2);
  attempts                          : Integer;
  evidence                          : String(200);
  source                            : String(30); 
}

entity Certifications : cuid,managed
{
    name              : Association to Employees;
    code              : String(40);
    title             : String(200);
    description       : String(800);
    module            : Association to TrainingModules;
    validityMonths    : Integer;

}

entity EmployeeCertifications : cuid, managed 
{
    employee                  : Association to Employees;
    certification             : Association to Certifications;
    issuedDate                : Date;
    expiryDate                : Date;
    status                    : Association to CertificationStatus;
    certificateUrl            : String(600);
}

entity AssignmentRules : cuid, managed 
{
    ruleName            : String(200);
    description         : String(1000);
    departmentCode      : String(30);
    jobRole             : String(80);
    locationcode        : Composition of many Locations on locationcode.code;
    module              : Association to TrainingModules;
    dueDays             : Integer; 
    priority            : Association to PriorityLevels;
    isActive            : Boolean default true;
}

entity Locations : cuid, managed 
{
    code         : String(30);
    name         : String(120);
    country      : String(60);
}

entity Departments   : cuid
{
    code             : String(30);
    name             : String(120);
    departmentlead   : Association to Departments;
}

entity TrainingTypes : CodeList
{
    key code         : String(10);
    name             : localized String(50);
    desc             : localized String(200);
}

entity PriorityLevels : CodeList
{
    key code          : String enum
    {
        high    = 'H';
        medium  = 'M';
        low     = 'L';
    };
}

entity Statuses : CodeList {
    key code : String enum {
        active = 'A';
        inactive = 'I';
        pending = 'P';
        completed = 'C';
    };
    name : localized String(50);
    desc : localized String(200);
}

entity AssignmentStatus : CodeList 
{
    key code            : String enum
    {
        in_Process    =   'I';
        on_hold       =   'H';
        pending       =   'P';
        completed     =   'c';
    };
}

entity CertificationStatus : CodeList 
{
    key code               : String enum
    {
        in_Process  =   'I';
        on_hold     =   'H';
        pending     =   'P';
        completed   =   'c';
    };
}

entity CompletionStatus : CodeList
{
    key code            : String enum
    {
        in_Process   =   'I';
        on_hold      =   'H';
        pending      =   'P';
        completed    =   'c';
    };
}







