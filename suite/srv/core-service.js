// const cds = require('@sap/cds');

// module.exports = class CoreService extends cds.ApplicationService {

//   async init() {

//     /** ---------------- EMAIL VALIDATION ---------------- */
//     this.before('CREATE', 'Users', req => {
//       const { email } = req.data;
//       if (!email || !email.includes('@')) {
//         req.reject(400, 'Invalid Email Address');
//       }
//     });

//     /** ---------------- ADMIN DEACTIVATION RULE ---------------- */
//     this.before('UPDATE', 'Users', async req => {
//       if (req.data.active === false) {
//         const admins = await SELECT
//           .from('sap.capire.core.UserRoles')
//           .where({ role_ID: '990e8400-e29b-41d4-a716-446655440005' }); // ADMIN role

//         if (admins.length <= 1) {
//           req.reject(400, 'At least one active admin is required');
//         }
//       }
//     });

//     /** ---------------- PREVENT ROLE DELETE ---------------- */
//     this.before('DELETE', 'Roles', async req => {
//       const roleID = req.data.ID;
//       const assigned = await SELECT
//         .from('sap.capire.core.UserRoles')
//         .where({ role_ID: roleID });

//       if (assigned.length > 0) {
//         req.reject(400, 'Cannot delete role assigned to users');
//       }
//     });

//     /** ---------------- PREVENT DEPARTMENT DELETE ---------------- */
//     this.before('DELETE', 'Departments', async req => {
//       const deptID = req.data.ID;
//       const users = await SELECT
//         .from('sap.capire.core.Users')
//         .where({ department_ID: deptID });

//       if (users.length > 0) {
//         req.reject(400, 'Department has users assigned');
//       }
//     });

//     /** ---------------- DEFAULT APPROVAL STATUS ---------------- */
//     this.before('CREATE', 'Approvals', req => {
//       if (!req.data.status_code) {
//         req.data.status_code = 'PENDING';
//       }
//     });

//     /** ---------------- APPROVER ONLY UPDATE ---------------- */
//     this.before('UPDATE', 'Approvals', req => {
//       if (req.data.status_code) {
//         if (req.user.id !== req.data.approver_ID) {
//           req.reject(403, 'Only assigned approver can update status');
//         }
//       }
//     });

//     /** ---------------- NOTIFICATION ON APPROVAL CREATE ---------------- */
//     this.after('CREATE', 'Approvals', async (data, req) => {
//       const tx = cds.tx(req);
//       await tx.run(
//         INSERT.into('sap.capire.core.Notification').entries({
//           users_ID: data.approver_ID,
//           title: 'New Approval Request',
//           message: `Approval pending for record ${data.referenceID}`,
//           read: false
//         })
//       );
//     });

//     /** ---------------- DUPLICATE SYSTEM SETTINGS ---------------- */
//     this.before('CREATE', 'SystemSettings', async req => {
//       const { settingName, module } = req.data;
//       const existing = await SELECT
//         .from('sap.capire.core.SystemSettings')
//         .where({ settingName, module });

//       if (existing.length > 0) {
//         req.reject(400, 'Setting already exists');
//       }
//     });

//     /** ---------------- FILE SIZE LIMIT ---------------- */
//     this.before('CREATE', 'Attachments', req => {
//       if (req.data.filesize > 10 * 1024 * 1024) {
//         req.reject(400, 'File size exceeds 10MB limit');
//       }
//     });

//     /** ---------------- AUDIT LOGS (GLOBAL) ---------------- */
//     this.after(['CREATE', 'UPDATE', 'DELETE'], '*', async (data, req) => {
//       if (!req.target || !data?.ID) return;

//       const tx = cds.tx(req);

//       await tx.run(
//         INSERT.into('sap.capire.core.AuditLogs').entries({
//           entityName: req.target.name,
//           recordID: data.ID,
//           action: req.event,
//           changedBy_ID: req.user?.id || 'SYSTEM',
//           oldValue: JSON.stringify(req._oldData || {}),
//           newValue: JSON.stringify(data)
//         })
//       );
//     });

//     return super.init();
//   }
// };












const cds = require('@sap/cds'); 
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = class CoreService extends cds.ApplicationService { init() {

  const { Companies, Departments, Designations, Levels, Users, Roles, Permissions, RolePermissions, UserRoles, ApprovalFlows, Approvals, Status, Notifications, SystemSettings, Attachments, AuditLogs } = cds.entities('CoreService')
  
  this.before('CREATE',Users,req=>{  //checking email validations
    const {email} =req.data;
    if(!email || !email.includes('@')){
      req.reject(400,'Invalid Email Address'); 
    }
  });

  this.before('UPDATE',Users,async (req)=>{ //checking if someone trying to delete the admin
    if(req.data.active === false){
      const admins = await SELECT.from(sap.capire.core.UserRoles).where({role_code: 'ADMIN'});
      if(admins.length <= 1){
        req.reject(400,'Atleast one active admine is required')
      }
    }
  });

  this.before('DELETE',Roles,async(req)=>{ //perventing deleting roles assigned to users
    const roleID =req.data.ID;
    const assignedUser= await SELECT.from(sap.capire.core.UserRoles).where({role_ID:roleID});
    if(assignedUser.length > 0 ){
      req.reject(400,'Cannot delete the role assigned  to users')
    }
  });

  this.before('DELETE',Departments,async req =>{ //perventing deleting departments
    const deptID = req.data.ID;
    const users = await SELECT.from(sap.capire.core.Users).where({department_ID:deptID});
    if(users.length > 0 ){
      req.reject(400,'Department has users assigned')
    }
  });

  this.before('CREATE',Approvals,async req=>{
    const {referenceID,approval_ID} = req.data;
    const refExi = await SELECT.one.from(Approvals).where({ID:referenceID});
    if(!refExi)
    {
      req.reject(400, 'Invalid referenceID. Record does not exist.');
    }
  })


  // this.before('CREATE',Approvals,req =>{ //default sataus must be pending
  //   if(req.data.status_code){
  //     req.data.status_code ='PENDING';
  //   }
  // });

  // this.before('UPDATE',Approvals, req=>{ //only approver can update the status
  //   if(req.data.status_code){
  //     if(req.users.ID !== req.data.approval_ID){
  //       req.reject(403,'only assigned approver can update the status');
  //     }
  //   }
  // });

  this.before('CREATE',Approvals,async(data,req)=>{ //notification
    const tx =cds.tx(req);
    await tx.run(INSERT.into(Notifications).entries(
      { user_ID:data.approval_ID,
      title: 'New Approval Request',
      message: `Approval request pending for record ${data.referenceID}`,
      read: false
    }));
  });
  
  this.before('CREATE',SystemSettings,async req=>{ //duplicate systemsettings
    const {settingName,module}= req.data;
    const existing = await SELECT.from(SystemSettings).where({settingName,module});
    if(existing.length>0){
      req.reject(400,'Setting already exist');
    }
  });

  this.before('CREATE',Attachments,req=>{ //file size limitations
    if(req.data.filesize > 10*1024*1024){
      req.reject(400,'filesize exceeds the limit');
    }
  });

  this.after(['CREATE','UPDATE','DELETE'],'*',async(data,req)=>{
    if(!req.target || !data?.ID) return;
    const tx =cds.tx(req);
    console.log(req.target.name);
    await tx.run( INSERT.into(AuditLogs).entries({
          entityName: req.target.name,
          recordID: data.ID,
          action: req.event,
          changedBy_ID: req.user?.id || 'SYSTEM',
          oldValue: JSON.stringify(req._oldData || {}),
          newValue: JSON.stringify(data)
    }
    ));
  });
  return super.init()
}}
