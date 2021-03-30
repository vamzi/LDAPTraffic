# LDAPTraffic

Send dummy search traffic to LDAP directory server

Sends search request every one second

`LDAPSearch.exe --help`

`Usage: ldapsearch [options`

`Options:`
`-h, --host <value> <Required> Hostname or IP Address of the LDAP Server ` 
`-p, --port <number> <Required> Port of the Directory Server`
`-b, --basedn <value> <Required> BaseDN where to send traffic to`
`-D, --binddn <value> <Required> BindDN to used to bind to server`
`-w, --password <value> <Required> Password to used to bind to server`
`-o, --objectclasses [objectclass...] <Required> Primary objectclass to perfrom search on`  
`-a, --attributes [attribute...] <Required> Attributes to perfrom search on`
`-i, --interval <number> <Optional> Repeat the operation at given interval (ms)`  
`--reuseconn <Default> Reuse the same connection for the next request`
`--no-reuseconn Do not Reuse the same connection for the next request` 
`-v, --vers Output the current version of ldapsearch`
`--help display help for command display help for command`


# 0.1.1

## Usage Example

`LDAPSearch.exe -h HOSTNAME -p PORT -b dc=example,dc=com -o inetorgperson -a uid sn -D cn=admin -w password`

`LDAPSearch.exe -h HOSTNAME -p PORT -b dc=example,dc=com -o inetorgperson -a uid sn -D cn=admin -w password -i 1000`

`LDAPSearch.exe -h HOSTNAME -p PORT -b dc=example,dc=com -o inetorgperson -a uid sn -D cn=admin -w password -i 1000 --no-reuseconn`

# 0.1.0

## Usage Example

`LDAPTraffic.exe -h HOSTNAME -p PORT -b dc=example,dc=com -o inetorgperson -a uid sn -D cn=admin -w password`
