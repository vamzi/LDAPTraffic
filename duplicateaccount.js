const ldap = require('ldapjs');
const { program } = require('commander');
var log = require('single-line-log').stdout;


program
    .requiredOption('-h, --host <value>', '<Required> Hostname or IP Address of the LDAP Server')
    .requiredOption('-p, --port <number>', '<Required> Port of the Directory Server')
    .requiredOption('-b, --basedn <value>', '<Required> BaseDN where to send traffic to')
    .requiredOption('-D, --binddn <value>', '<Required> BindDN to used to bind to server')
    .requiredOption('-w, --password <value>', '<Required> Password to used to bind to server')
    .requiredOption('-f, --filter <value>', '<Required> Filter template to find duplicates. Use {n} in template to loop from min to max numbers (Example: ((sAMAccountname=user{n}))')
    .requiredOption('-m, --minValue <value>', '<Required> minimum index')
    .requiredOption('-x, --maxValue <value>', '<Required> maximum index');

program.version('0.0.1', '-v, --vers', 'Output the current version of duplicate accounts');
program.parse(process.argv);

const options = program.opts();

console.dir(options);
const client = ldap.createClient({
    url: [`ldap://${options.host}:${options.port}`]
});

client.on('error', (err) => {
    console.log(err);
})
var resultCount = 0;
client.on('connect', async () => {
    console.log("# Connected to LDAP Server: ", options.host);
    client.bind(options.binddn, options.password, async (err, res) => {
        if (err) {
            console.error("Bind failed ", options.binddn, ":", options.password);
            console.error(err.lde_message);
        }
        if (res) {
            console.log("Bind success", options.binddn, ":", options.password);
            for (var i = options.minValue; i < options.maxValue; i++) {
                var fil = options.filter + "";
                var filter = fil.replace('{n}', i)
                // filter = "(sAMAccountname=usertest" + i + ")";
                var search_opts = {};

                search_opts = {
                    filter: filter,
                    scope: 'sub'
                };

                client.search(options.basedn, search_opts, (err, res) => {
                    var count = 0;
                    var currResults = []
                    res.on('searchEntry', (entry) => {
                        currResults.push(entry);
                        count++;
                        if (count > 1) {
                            console.log("# Duplicate Found: \n")
                            currResults.forEach(currResult => {
                                for (var key in currResult.object) {
                                    if (key + "" === "dn") {
                                        console.log(currResult.object[key]);
                                    }
                                }
                                console.log("\n");
                            });

                        }
                    });
                    res.on('searchReference', (referral) => {
                        // console.log('referral: ' + referral.uris.join());
                    });
                    res.on('error', (err) => {
                        // console.error('\nerror: ' + err.message);
                    });
                    res.on('end', (result) => {
                        client.unbind((err) => { })
                    });
                });
            }
        }
    });
});