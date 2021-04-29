const ldap = require('ldapjs');
const {askQuestion} = require('./util');
const { program } = require('commander');
var log = require('single-line-log').stdout;


program
  .requiredOption('-h, --host <value>', '<Required> Hostname or IP Address of the LDAP Server')
  .requiredOption('-p, --port <number>', '<Required> Port of the Directory Server')
  .requiredOption('-b, --basedn <value>', '<Required> BaseDN where to send traffic to')
  .requiredOption('-D, --binddn <value>', '<Required> BindDN to used to bind to server')
  .requiredOption('-w, --password <value>', '<Required> Password to used to bind to server')
  .option('-o, --objectclasses [objectclass...]', '<Required> Primary objectclass to perfrom search on')
  .option('-f, --filter <value>', '<Optional>filter for search operation')
  .option('-s, --scope <value>', '<Optional>scope for search operation')
  .option('-a, --attributes [attribute...]', '<Optional> Attributes to perfrom search on')
  .option('-i, --interval <number>', '<Optional> Repeat the operation at given interval (ms)')
  .option('-gz, --pageSizeLimit <number>', '<Optional> Page size limit for search')
  .option('-g, --pageSize <number>', '<Optional> Page size for search')
  .option('--reuseconn', '<Default> Reuse the same connection for the next request')
  .option('--no-reuseconn', 'Do not Reuse the same connection for the next request')
  .option('--paging', '<Default> enable paging on search request')
  .option('--no-paging', 'Disbale paging on sarch request');;
  program.version('0.1.3', '-v, --vers', 'Output the current version of ldapsearch');

program.parse(process.argv);

const options = program.opts();

console.dir(options);

if(options.reuseconn == undefined){
  options.reuseconn = true;
}
if(options.paging == undefined){
  options.paging = true;
}
if(options.pagingSize == undefined){
  options.pagingSize = 100;
}


const client = ldap.createClient({
    url: [`ldap://${options.host}:${options.port}`]
  });
  
  client.on('error', (err) => {
    console.log(err);
  })
  
  client.on('connect',async ()=>{
      console.log("# Connected to LDAP Server: ",options.host);
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
                  try{
                  if(options.objectclasses.length>0){  
                      search_filter = "(|";
                      for(var i=0;i<options.objectclasses.length;i++){
                          search_filter = search_filter + '(objectclass='+options.objectclasses[i]+')'
                      }
                      search_filter = search_filter+")"
                  }else{
                      search_filter = search_filter + '(objectclass='+options.objectclasses[0]+')'
                  }
                }catch(err){}
                var search_opts= {};
                if(options.filter){
                    search_opts = {
                      filter: options.filter,
                      scope: options.scope
                  };
                }else{
                  search_opts = {
                      filter: search_filter,
                      scope: 'sub'
                  };
                }
                if(options.attributes){
                  search_opts = {
                    ...search_opts,
                    attributes : options.attributes,	
                  }
                }
                if(options.pageSizeLimit){
                  search_opts = {
                    ...search_opts,
                    paged: true,
                    sizeLimit: options.pageSizeLimit
                  }
                }

                  
                  const timer = setInterval(()=>{
                  ++searchRequestCount
                  const strtTime= Date.now();
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
                            const endTime= Date.now();
                              searchRequestCount++;
                              log("searchRequestCount: ",searchRequestCount,"\nsearchResponseCount: ",++searchResponseCount," LastResponseTime: ",(endTime-strtTime),"ms");
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
                    try{
                    if(options.objectclasses.length>0){  
                        search_filter = "(|";
                        for(var i=0;i<options.objectclasses.length;i++){
                            search_filter = search_filter + '(objectclass='+options.objectclasses[i]+')'
                        }
                        search_filter = search_filter+")"
                    }else{
                        search_filter = search_filter + '(objectclass='+options.objectclasses[0]+')'
                    }
                  }catch(err){}
                  var search_opts= {};
                  if(options.filter){
                      search_opts = {
                        filter: options.filter,
                        scope: options.scope
                    };
                  }else{
                    search_opts = {
                        filter: search_filter,
                        scope: 'sub'
                    };
                  }
                  if(options.attributes){
                    search_opts = {
                      ...search_opts,
                      attributes : options.attributes,	
                    }
                  }
                  if(options.pageSizeLimit){
                    search_opts = {
                      ...search_opts,
                      paged: true,
                      sizeLimit: options.pageSizeLimit
                    }
                  }
                    ++searchRequestCount
                    const strtTime= Date.now();
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
                              const endTime= Date.now();
                                searchRequestCount++;
                                log("searchRequestCount: ",searchRequestCount,"\nsearchResponseCount: ",++searchResponseCount," LastResponseTime: ",(endTime-strtTime),"ms");
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
              console.error("# Bind failed ",options.binddn,":",options.password);
              console.error(err.lde_message);
          }
          if(res){
              console.log("# Bind success",options.binddn,":",options.password);
              var search_filter = "";
              try{
                if(options.objectclasses.length>0){  
                    search_filter = "(|";
                    for(var i=0;i<options.objectclasses.length;i++){
                        search_filter = search_filter + '(objectclass='+options.objectclasses[i]+')'
                    }
                    search_filter = search_filter+")"
                }else{
                    search_filter = search_filter + '(objectclass='+options.objectclasses[0]+')'
                }
              }catch(err){}
              var search_opts= {};
              if(options.filter){
                  search_opts = {
                    filter: options.filter,
                    scope: options.scope
                };
              }else{
                search_opts = {
                    filter: search_filter,
                    scope: 'sub'
                };
              }
              if(options.attributes){
                search_opts = {
                  ...search_opts,
                  attributes : options.attributes,	
                }
              }
              if(options.pageSizeLimit){
                search_opts = {
                  ...search_opts,
                  sizeLimit: +options.pageSizeLimit
                }
              }
              if(options.paging){
                search_opts = {
                  ...search_opts,
                  paged: {
                    pageSize: +options.pageSize,
                    pagePause: true
                  },
                }
              }
              var entryCount = 0;
              var pageNo=1;
              client.search(options.basedn, search_opts, (err, res) => {
                  res.on('searchEntry', (entry) => {
                    entryCount++;
                  
                    console.log(entry.object['']);
                      for (var key in entry.object) {
                        if(key+"" !== "controls"){
                        console.log(key+": "+entry.object[key]);
                        }
                      }
                      console.log("\n");
                    
                  });
                  res.on('searchReference', (referral) => {
                    // console.log('referral: ' + referral.uris.join());
                  });
                  res.on('page',async (entry, cb) => {                   
                    console.log(`# Page ${pageNo} End`);
                    pageNo++;
                    if(cb){
                      const ans = await askQuestion(`# Do you want to continue to pageNo: ${pageNo}? [y/n]: `);
                      if(ans+'' === 'y'){
                      cb();
                      }else{
                        process.exit();
                      }
                    }
                  });
                  res.on('error', (err) => {
                    console.error('\nerror: ' + err.message);
                    client.unbind((err) => {});
                  });
                  res.on('end', (result) => {
                      console.log("# Total Entries: "+entryCount);
                      client.unbind((err) => {});
                  });
              });   
          }
        })
      }
  });



