# LDAPTraffic
 Send dummy search traffic to LDAP directory server
 
 Sends search request every one second

 LDAPTraffic.exe --help
 
 Options:
  -v, --vers                             output the current version
  -h, --host <value>                     Hostname or IP Address of the LDAP Server
  -p, --port <number>                    Port of the Directory Server
  -b, --basedn <value>                   BaseDN where to send traffic to
  -D, --binddn <value>                   BindDN to used to bind to server
  -w, --password <value>                 Password to used to bind to server
  -o, --objectclasses [objectclasse...]  Primary objectclass to perfrom search on
  -a, --attributes [attribute...]        Attributes to perfrom search on
  --help                                 display help for command
