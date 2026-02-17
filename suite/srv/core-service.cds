using { sap.capire.core as my } from '../db/core_schema';
service CoreService {
    entity Companies as projection on my.Companies;
    entity Departments as projection on my.Departments;
    entity Designations as projection on my.Designations;
    entity Levels as projection on my.Levels;
    entity Users as projection on my.Users;
    entity Roles as projection on my.Roles;
    entity Permissions as projection on my.Permissions;
    entity RolePermissions as projection on my.RolePermission;
    entity UserRoles as projection on my.UserRoles;
    entity ApprovalFlows as projection on my.ApprovalFlows;
    entity Approvals as projection on my.Approvals;
    entity Status as projection on my.Status;
    entity Notifications as projection on my.Notification;
    entity SystemSettings as projection on my.SystemSettings;
    entity Attachments as projection on my.Attachments;
    entity AuditLogs as projection on my.AuditLogs;
}
