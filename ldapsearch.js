const ldap = require('ldapjs');
const { program } = require('commander');
var log = require('single-line-log').stdout;


program
  .requiredOption('-h, --host <value>', '<Required> Hostname or IP Address of the LDAP Server')
  .requiredOption('-p, --port <number>', '<Required> Port of the Directory Server')
  .requiredOption('-b, --basedn <value>', '<Required> BaseDN where to send traffic to')
  .requiredOption('-D, --binddn <value>', '<Required> BindDN to used to bind to server')
  .requiredOption('-w, --password <value>', '<Required> Password to used to bind to server')
  .requiredOption('-o, --objectclasses [objectclass...]', '<Required> Primary objectclass to perfrom search on')
  .requiredOption('-a, --attributes [attribute...]', '<Required> Attributes to perfrom search on')
  .option('-i, --interval <number>', '<Optional> Repeat the operation at given interval (ms)')
  .option('--reuseconn', '<Default> Reuse the same connection for the next request')
  .option('--no-reuseconn', 'Do not Reuse the same connection for the next request');
  program.version('0.1.1', '-v, --vers', 'Output the current version of ldapsearch');

program.parse(process.argv);

const options = program.opts();

console.dir(options);

if(options.reuseconn == undefined){
  options.reuseconn = true;
}

const client = ldap.createClient({
    url: [`ldap://${options.host}:${options.port}`]
  });
  
  client.on('error', (err) => {
    console.log(err);
  })
  
  client.on('connect',async ()=>{
      console.log("Connected to LDAP Server: ",options.host);
      if(options.interval){
        if(options.reuseconn){
          var searchRequestCount = 0;
          var searchResponseCount = 0;
            client.bind(options.binddn,options.password,async (err,res)=>{
              if(err){
                  console.error("Bind failed ",options.binddn,":",options.password);
                  console.error(err.lde_message);
              }
              if(res){
                  console.log("Bind success",options.binddn,":",options.password);
                  var search_filter = "";
                  if(options.objectclasses.length>0){  
                      search_filter = "(|";
                      for(var i=0;i<options.objectclasses.length;i++){
                          search_filter = search_filter + '(objectclass='+options.objectclasses[i]+')'
                      }
                      search_filter = search_filter+")"
                  }else{
                      search_filter = search_filter + '(objectclass='+options.objectclasses[0]+')'
                  }
                  const search_opts = {
                      filter: search_filter,
                      attributes : options.attributes,	
                      scope: 'sub'
                  };

                  
                  const timer = setInterval(()=>{
                  ++searchRequestCount
                  client.search(options.basedn, search_opts, (err, res) => {
                
                      res.on('searchEntry', (entry) => {
                        //console.log('entry: ' + JSON.stringify(entry.object));
                      });
                      res.on('searchReference', (referral) => {
                        // console.log('referral: ' + referral.uris.join());
                      });
                      res.on('error', (err) => {
                        console.error('\nerror: ' + err.message);
                      });
                      res.on('end', (result) => {
                          if(result.status===0){
                              searchRequestCount++;
                              log("searchRequestCount: ",searchRequestCount,"\nsearchResponseCount: ",++searchResponseCount);
                          }
                      });
                  });   
                },options.interval);

              }
            })
        }else{
          
          var searchRequestCount = 0;
          var searchResponseCount = 0;
          const timer = setInterval(()=>{
            var client = ldap.createClient({
              url: [`ldap://${options.host}:${options.port}`]
            });
            
            client.on('error', (err) => {
              console.log(err);
            })
            
            client.on('connect',async ()=>{
              client.bind(options.binddn,options.password,async (err,res)=>{
                if(err){
                //    console.error("Bind failed ",options.binddn,":",options.password);
                //    console.error(err.lde_message);
                }
                if(res){
                  //  console.log("Bind success",options.binddn,":",options.password);
                    var search_filter = "";
                    if(options.objectclasses.length>0){  
                        search_filter = "(|";
                        for(var i=0;i<options.objectclasses.length;i++){
                            search_filter = search_filter + '(objectclass='+options.objectclasses[i]+')'
                        }
                        search_filter = search_filter+")"
                    }else{
                        search_filter = search_filter + '(objectclass='+options.objectclasses[0]+')'
                    }
                    const search_opts = {
                        filter: search_filter,
                        attributes : options.attributes,	
                        scope: 'sub'
                    };
                    ++searchRequestCount
                    client.search(options.basedn, search_opts, (err, res) => {
                  
                        res.on('searchEntry', (entry) => {
                          //console.log('entry: ' + JSON.stringify(entry.object));
                        });
                        res.on('searchReference', (referral) => {
                          // console.log('referral: ' + referral.uris.join());
                        });
                        res.on('error', (err) => {
                          console.error('\nerror: ' + err.message);
                          client.unbind((err) => {});
                        });
                        res.on('end', (result) => {
                            if(result.status===0){
                                searchRequestCount++;
                                log("searchRequestCount: ",searchRequestCount,"\nsearchResponseCount: ",++searchResponseCount);
                            }
                          client.unbind((err) => {});
                        });
                    });   
                }
              })
            });
          },options.interval);
        }
      }else{
        client.bind(options.binddn,options.password,async (err,res)=>{
          if(err){
              console.error("Bind failed ",options.binddn,":",options.password);
              console.error(err.lde_message);
          }
          if(res){
              console.log("Bind success",options.binddn,":",options.password);
              var search_filter = "";
              if(options.objectclasses.length>0){  
                  search_filter = "(|";
                  for(var i=0;i<options.objectclasses.length;i++){
                      search_filter = search_filter + '(objectclass='+options.objectclasses[i]+')'
                  }
                  search_filter = search_filter+")"
              }else{
                  search_filter = search_filter + '(objectclass='+options.objectclasses[0]+')'
              }
              const search_opts = {
                  filter: search_filter,
                  attributes : options.attributes,	
                  scope: 'sub'
              };
              var entryCount = 0;
              client.search(options.basedn, search_opts, (err, res) => {

                  res.on('searchEntry', (entry) => {
                    entryCount++;
                    console.log(entry.object);
                  });
                  res.on('searchReference', (referral) => {
                    // console.log('referral: ' + referral.uris.join());
                  });
                  res.on('error', (err) => {
                    console.error('\nerror: ' + err.message);
                    client.unbind((err) => {});
                  });
                  res.on('end', (result) => {
                      console.log("Total Entries: "+entryCount);
                      client.unbind((err) => {});
                  });
              });   
          }
        })
      }
  });



