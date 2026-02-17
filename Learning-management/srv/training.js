const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const 
  {
    Employees,TrainingModules,TrainingSessions,SessionEnrollments,LearningRoadmap,LearningRoadmapModules,
    ModuleAssignments,CompletionPerformanceRecords,Certifications,EmployeeCertifications,AssignmentRules
  } = db.entities("TrainingManagementSystem");
  const today = () => new Date().toISOString().slice(0,10);

  const addDays = (d, n) => 
  {
    let x = new Date(d);
    x.setDate(x.getDate() + (n || 0));
    return x.toISOString().slice(0,10);
  };

  const addMonths = (d, n) => 
  {
    let x = new Date(d);
    x.setMonth(x.getMonth() + (n || 0));
    return x.toISOString().slice(0,10);
  };

  async function getEmployeeForUser(tx, req)
  {
    return tx.run(
      SELECT.one.from(Employees)
        .where({ email: req.user.id })
    );
  }

  this.before(["CREATE","UPDATE"], "AdminService.TrainingModules", req=>
  {
    if(!req.data.title) req.reject(400,"Title required");
    if(req.data.durationMins < 0) req.reject(400,"Duration invalid");
  });

  this.before(["CREATE","UPDATE"], "AdminService.TrainingSessions", req=>
  {
    if(!req.data.module_ID) req.reject(400,"Module required");
    if(!req.data.status) req.data.status="Scheduled";
  });

  
  this.before(["CREATE","UPDATE"], "AdminService.AssignmentRules", req=>
  {
    if(!req.data.ruleName) req.reject(400,"RuleName required");
    if(!req.data.module_ID) req.reject(400,"Module required");
    if(req.data.isActive === undefined) req.data.isActive=true;
  });

  
  this.before(["CREATE","UPDATE"], "AdminService.Certifications", req=>
  {
    if(!req.data.code) req.reject(400,"Code required");
    if(!req.data.title) req.reject(400,"Title required");
  });

  
  this.before("READ","EmployeeService.MyAssignments", async req=>
  {
    const tx=cds.tx(req);
    const emp=await getEmployeeForUser(tx,req);
    req.query.where({employee_ID:emp.ID});
  });

  
  this.before("READ","EmployeeService.MyCertifications", async req=>
  {
    const tx=cds.tx(req);
    const emp=await getEmployeeForUser(tx,req);
    req.query.where({employee_ID:emp.ID});
  });

  this.before("READ","EmployeeService.MyProfile", async req=>
  {
    const tx=cds.tx(req);
    const emp=await getEmployeeForUser(tx,req);
    req.query.where({ID:emp.ID});
  });

 
  this.before("READ","EmployeeService.MyEnrollments", async req=>
  {
    const tx=cds.tx(req);
    const emp=await getEmployeeForUser(tx,req);
    req.query.where({employee_ID:emp.ID});
  });

  this.before(["CREATE","UPDATE"], Employees, req=>
  {
    if(!req.data.fullName) req.reject(400,"Name required");
    if(!req.data.email || !req.data.email.includes("@"))
      req.reject(400,"Valid email required");
    if(!req.data.status) req.data.status="Active";
  });

  this.after("CREATE", Employees, async(emp,req)=>
  {
    const tx=cds.tx(req);

    const rules=await tx.run(
      SELECT.from(AssignmentRules).where({isActive:true})
    );

    for(const r of rules){

      if(r.jobRole && r.jobRole!==emp.jobRole) continue;

      const exists=await tx.run(
        SELECT.one.from(ModuleAssignments)
          .where({
            employee_ID:emp.ID,
            module_ID:r.module_ID
          })
      );
      if(exists) continue;

      await tx.run(
        INSERT.into(ModuleAssignments).entries({
          employee_ID:emp.ID,
          module_ID:r.module_ID,
          assignedBy:"SYSTEM",
          assignedToType:"RULE",
          assignedToValue:r.ruleName,
          assignedDate:today(),
          dueDate:addDays(today(),r.dueDays),
          status_code:"P",
          priority_code:r.priority_code || "M",
          source:"RULE"
        })
      );
    }
  });

  this.before("CREATE","EmployeeService.MyEnrollments", async req=>
  {
    const tx=cds.tx(req);
    const {session_ID,employee_ID}=req.data;

    const dup=await tx.run(
      SELECT.one.from(SessionEnrollments)
        .where({session_ID,employee_ID})
    );
    if(dup) req.reject(400,"Already enrolled");

    const session=await tx.run(
      SELECT.one.from(TrainingSessions)
        .where({ID:session_ID})
    );

    const count=await tx.run(
      SELECT.from(SessionEnrollments)
        .where({session_ID})
    );

    if(session.capacity && count.length>=session.capacity)
      req.reject(400,"Session Full");

    req.data.enrolledDate=new Date().toISOString();
    req.data.attendance="NotMarked";
  });


  this.before("CREATE",LearningRoadmapModules, async req=>
  {
    const tx=cds.tx(req);

    const dup=await tx.run(
      SELECT.one.from(LearningRoadmapModules)
        .where({
          roadmap_ID:req.data.roadmap_ID,
          module_ID:req.data.module_ID
        })
    );

    if(dup) req.reject(400,"Duplicate module");
    if(!req.data.sequenece) req.data.sequenece=1;
  });


  this.before("CREATE",ModuleAssignments,req=>
  {
    req.data.status_code="P";
    req.data.assignedDate=today();
  });

  this.after("CREATE",ModuleAssignments, async(assign,req)=>
  {
    const tx=cds.tx(req);
    await tx.run(
      INSERT.into(CompletionPerformanceRecords).entries({
        assignment_ID:assign.ID,
        status_code:"P",
        attempts:0,
        score:0,
        source:"SYSTEM"
      })
    );
  });

  this.after(["CREATE","UPDATE"],CompletionPerformanceRecords,
    async(rec,req)=>{
      const tx=cds.tx(req);

      await tx.run(
        UPDATE(ModuleAssignments)
          .set({status_code:rec.status_code})
          .where({ID:rec.assignment_ID})
      );

      if(rec.status_code==="C" && !rec.completionDate){
        await tx.run(
          UPDATE(CompletionPerformanceRecords)
            .set({completionDate:today()})
            .where({ID:rec.ID})
        );
      }
  });

this.before(["CREATE","UPDATE"], TrainingModules, req => 
{

  if (!req.data.title)
    req.reject(400, "Training Module title is required");

  if (req.data.durationMins !== null && req.data.durationMins < 0)
    req.reject(400, "Duration cannot be negative");

  if (req.data.isMandtory === undefined)
    req.data.isMandtory = false;

});

this.after("CREATE", TrainingModules, async (module, req) => 
{

  const tx = cds.tx(req);

  if (module.isMandtory === true) {

    const defaultRoadmap = await tx.run(
      SELECT.one.from(LearningRoadmap)
        .where({ code: "DEFAULT" })
    );

    if (defaultRoadmap) {
      await tx.run(
        INSERT.into(LearningRoadmapModules).entries({
          roadmap_ID: defaultRoadmap.ID,
          module_ID: module.ID,
          sequenece: 999,
          isRequired: true
        })
      );
    }
  }
});

this.before(["CREATE","UPDATE"], LearningRoadmap, req => 
{

  if (!req.data.code)
    req.reject(400, "Roadmap code required");

  if (!req.data.title)
    req.reject(400, "Roadmap title required");

});

this.on("cloneRoadmap", async req => {

  const tx = cds.tx(req);

  const source = await tx.run(
    SELECT.one.from(LearningRoadmap)
      .where({ ID: req.data.roadmapID })
  );

  if (!source)
    req.reject(404, "Roadmap not found");

  const newRoadmap = await tx.run(
    INSERT.into(LearningRoadmap).entries({
      code: req.data.newCode,
      title: source.title + " Copy",
      description: source.description
    })
  );

  const modules = await tx.run(
    SELECT.from(LearningRoadmapModules)
      .where({ roadmap_ID: source.ID })
  );

  for (let m of modules) {
    await tx.run(
      INSERT.into(LearningRoadmapModules).entries({
        roadmap_ID: newRoadmap.ID,
        module_ID: m.module_ID,
        sequenece: m.sequenece,
        isRequired: m.isRequired
      })
    );
  }

  return "Roadmap cloned";
});


this.before("CREATE", LearningRoadmapModules, async req => 
{

  const tx = cds.tx(req);

  const exists = await tx.run(
    SELECT.one.from(LearningRoadmapModules)
      .where({
        roadmap_ID: req.data.roadmap_ID,
        module_ID: req.data.module_ID
      })
  );

  if (exists)
    req.reject(400, "Module already in roadmap");

});


this.before(["CREATE","UPDATE"], Certifications, req =>
{

  if (!req.data.code)
    req.reject(400, "Certification code required");

  if (!req.data.title)
    req.reject(400, "Certification title required");

});

this.after("CREATE", Certifications, async (cert, req) => 
{

  const tx = cds.tx(req);
  if (cert.module_ID) {
    await tx.run(
      UPDATE(TrainingModules)
        .set({ isMandtory: true })
        .where({ ID: cert.module_ID })
    );
  }
});

this.before("CREATE", EmployeeCertifications, async req => 
{

  const tx = cds.tx(req);

  const cert = await tx.run(
    SELECT.one.from(Certifications)
      .where({ ID: req.data.certification_ID })
  );

  if (!cert)
    req.reject(404, "Certification not found");

  if (!req.data.issuedDate)
    req.data.issuedDate = today();

  if (cert.validityMonths && !req.data.expiryDate) {
    req.data.expiryDate =
      addMonths(req.data.issuedDate, cert.validityMonths);
  }

  req.data.status_code = "P";

});

this.after("CREATE", EmployeeCertifications, async (rec, req) => 
{

  const tx = cds.tx(req);
  const cert = await tx.run(
    SELECT.one.from(Certifications)
      .where({ ID: rec.certification_ID })
  );

  if (cert?.module_ID) {
    await tx.run(
      UPDATE(ModuleAssignments)
        .set({ status_code: "C" })
        .where({
          employee_ID: rec.employee_ID,
          module_ID: cert.module_ID
        })
    );
  }
});

this.before("CREATE","StatusesService.EmployeeCertifications",
    async req=>
    {
      const tx=cds.tx(req);

      const cert=await tx.run(
        SELECT.one.from(Certifications)
          .where({ID:req.data.certification_ID})
      );

      if(cert?.validityMonths){
        req.data.expiryDate=
          addMonths(req.data.issuedDate,cert.validityMonths);
      }

      req.data.status_code="P";
  });

  
  this.on("reassignModule", async req=>{
    const tx=cds.tx(req);

    await tx.run(
      UPDATE(ModuleAssignments)
        .set({
          employee_ID:req.data.newEmployeeID,
          status_code:"P"
        })
        .where({ID:req.data.assignmentID})
    );

    return "Module reassigned successfully";
  });

});
