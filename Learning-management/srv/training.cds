using {TrainingManagementSystem as tms} from '../db/schema';

service AdminService 
{
  entity TrainingModules as projection on tms.TrainingModules;
  entity LearningRoadmap as projection on tms.LearningRoadmap;
  entity TrainingSessions as projection on tms.TrainingSessions;
  entity AssignmentRules as projection on tms.AssignmentRules;
  entity Certifications as projection on tms.Certifications;
  
}

service EmployeeService 
{
  entity MoudleAssignments as projection on tms.ModuleAssignments;
  entity MyCertifications as projection on tms.EmployeeCertifications;
  entity Employees as projection on tms.Employees;
  entity SessionEnrollments as projection on tms.SessionEnrollments;
  entity LearningRoadmapModules as projection on tms.LearningRoadmapModules;
}

service StatusesService
{
  entity CompletionPerformanceRecords as projection on tms.CompletionPerformanceRecords;
  entity EmployeeCertifications as projection on tms.EmployeeCertifications;
  entity Statuses as projection on tms.Statuses;
  entity AssignmentStatus as projection on tms.AssignmentStatus;
  entity CertificationStatus as projection on tms.CertificationStatus;
  entity CompletionStatus as projection on tms.CompletionStatus;
}

