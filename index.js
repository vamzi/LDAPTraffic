const ldap = require('ldapjs');
const { program } = require('commander');
var log = require('single-line-log').stdout;
program.version('0.1.0', '-v, --vers', 'output the current version');

program
  .requiredOption('-h, --host <value>', 'Hostname or IP Address of the LDAP Server')
  .requiredOption('-p, --port <number>', 'Port of the Directory Server')
  .requiredOption('-b, --basedn <value>', 'BaseDN where to send traffic to')
  .requiredOption('-D, --binddn <value>', 'BindDN to used to bind to server')
  .requiredOption('-w, --password <value>', 'Password to used to bind to server')
  .requiredOption('-o, --objectclasses [objectclasse...]', 'Primary objectclass to perfrom search on')
  .requiredOption('-a, --attributes [attribute...]', 'Attributes to perfrom search on');

program.parse(process.argv);

const options = program.opts();

console.dir(options);

const client = ldap.createClient({
    url: [`ldap://${options.host}:${options.port}`]
  });
  
  client.on('error', (err) => {
    console.log(err);
  })
  
  client.on('connect',async ()=>{
      console.log("Connected to LDAP Server: ",options.host);
      client.bind(options.binddn,options.password,async (err,res)=>{
        if(err){
            console.error("Bind failed ",options.binddn,":",options.password);
            console.error(err.lde_message);
        }
        if(res){
            console.log("Bind success",options.binddn,":",options.password);
            var search_filter = "";
            if(options.objectclasses.length>0){  
                search_filter = "(&";
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

            var searchRequestCount = 0;

            setInterval(()=>{



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
                            log("searchRequestCount: "+searchRequestCount);
                        }
                    });
                });  

            },1000);
                 
           
        }
      })
    });



