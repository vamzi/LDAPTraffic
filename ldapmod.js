const ldap = require('ldapjs');

let controls = new ldap.Control({
    type: "VDS_LDAPSystemAgentControl_OID",
    criticality: true
  });
  

const options={ 
    host: '192.168.10.217',
    port: '2389',
    binddn: 'cn=Directory Manager',
    password: 'secretsecret' 
};
const client = ldap.createClient({
    url: [`ldap://${options.host}:${options.port}`]
  });
  
  client.on('error', (err) => {
    console.log(err);
  })
  
  client.on('connect',async ()=>{
      console.log("Connected to:"+`ldap://${options.host}:${options.port}`);
      const strtTime = Date.now();
      client.bind(options.binddn,options.password,async (err,res)=>{
        if(err){
            console.error("Bind failed ",options.binddn,":",options.password);
            console.error(err.lde_message);
            client.unbind((err) => {});
        }
        if(res){
          console.log("Bind success ",options.binddn,":",options.password);

          const change1 = new ldap.Change({
            operation: 'replace',
            modification: {
                pwdFailureTime: undefined
            }
          });
          
          const change2 = new ldap.Change({
            operation: 'replace',
            modification: {
                pwdAccountLockedTime: undefined
            }
          });
          
          client.modify('uid=vkothapalli,o=vamsihdap', change1,controls,(err,res) => {
            if(res){
                console.log("ldap modify success!");
            }
            if(err){
                console.error(err.lde_message);
            }
            
          });
          client.modify('uid=vkothapalli,o=vamsihdap', change2,controls,(err,res) => {
            if(res){
                console.log("ldap modify success!");
            }
            if(err){
                console.error(err.lde_message);
            }
            
          });
          client.unbind((err) => {});
          const endTime = Date.now();
          console.log("\nResponseTime: "+(endTime-strtTime)+"ms")
      
        }  
      })
  });