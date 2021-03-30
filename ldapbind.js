const ldap = require('ldapjs');
const { program } = require('commander');
var log = require('single-line-log').stdout;


program
  .requiredOption('-h, --host <value>', '<Required> Hostname or IP Address of the LDAP Server')
  .requiredOption('-p, --port <number>', '<Required> Port of the Directory Server')
  .requiredOption('-D, --binddn <value>', '<Required> BindDN to used to bind to server')
  .requiredOption('-w, --password <value>', '<Required> Password to used to bind to server')
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
          var bindRequestCount = 0;
          var bindResponseCount = 0;
            setInterval(()=>{
                bindRequestCount++;
                client.bind(options.binddn,options.password,async (err,res)=>{
                    if(res){
                        log("bindRequestCount: ",bindRequestCount,"\nbindResponseCount: ",++bindResponseCount);
                    }
                })
            },options.interval);             
        }else{
            var bindRequestCount = 0;
            var bindResponseCount = 0;
          const timer = setInterval(()=>{
            var client = ldap.createClient({
              url: [`ldap://${options.host}:${options.port}`]
            });
            
            client.on('error', (err) => {
              console.log(err);
            })
            
            client.on('connect',async ()=>{
                bindRequestCount++;
                client.bind(options.binddn,options.password,async (err,res)=>{
                    if(res){
                        log("bindRequestCount: ",bindRequestCount,"\nbindResponseCount: ",++bindResponseCount);
                    }
                    client.unbind((err) => {});
                })
            });
          },options.interval);
        }
      }else{
        client.bind(options.binddn,options.password,async (err,res)=>{
          if(err){
              console.error("Bind failed ",options.binddn,":",options.password);
              console.error(err.lde_message);
              client.unbind((err) => {});
          }
          if(res){
            console.log("Bind success ",options.binddn,":",options.password);
            client.unbind((err) => {});
          }
        })
      }
  });



