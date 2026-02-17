const cds = require('@sap/cds');
const { data } = require('@sap/cds/lib/dbs/cds-deploy');

module.exports = class ProcessorSerice extends cds.ApplicationService { init() {

 // const { Incidents, Customers } = cds.entities('ProcessorSerice')
this.before('CREATE', 'Incidents',async (req)=>{
  this.changeinStatusBaseDonurgency(req.data);
}
);
this.before('UPDATE','Incidents',async(req) => {
  this.onUpdate(req.data);
});


  return super.init()
}

changeinStatusBaseDonurgency(data){
  let urgency = data.title?.match(/urgent/i);
  if(urgency){
    data.status_code ='H';
  }
  else{
    data.status_code ='L';
  }
}

onUpdata(data){
  if(data.urgency === 'i'){
    data.status_code ='H';
  }
  else if (data.urgency ==='2'){
    data.status_code='H';
  }
  else if (data.urgency ==='3'){
    data.status_code ='L';
  }
}
}