const fs = require('fs');
const { uuid } = require('uuidv4');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
var iu=0;
function getUid(){
    //return iu+1;
    return uuid().replace(/-/g,'');
}

function getSeqUid(){
    iu = iu+1
    return iu;
}
const max = 45000;
const fileName = 'random';
if(fs.existsSync(`./${fileName}_${max}.ldif`)){
    fs.unlinkSync(`./${fileName}_${max}.ldif`)
}



var initContent = `
dn: ou=iiq,o=sources
cacheModifyTimestamp: 20210726223618.223Z
cacheModifiersName: cn=Directory Manager
cacheCreatorsName: cn=Directory Manager
ou: iiq
entrydn: ou=iiq,o=sources
objectclass: top
objectclass: vdapcontainer
objectclass: organizationalUnit
modifyTimestamp: 20210726223618.223Z
modifiersName: cn=Directory Manager
createTimestamp: 20210726223618.223Z
creatorsName: cn=Directory Manager
cacheCreateTimestamp: 20210726223618.223Z
` 
fs.writeFileSync(`./${fileName}_${max}.ldif` , initContent, { flag: 'a+' }, err => {})

for(var i=0;i<max;i++){
    var uuids = getUid();

    var value =  getUid();
    var identityid = getUid();
    var nativeidentity =  getSeqUid();
    var application =  getUid();
    const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
    var content=`
dn: sptidentityentitlement=${uuids},ou=iiq,o=sources
displayname: ${randomName}
cacheCreatorsName: cn=Directory Manager
entrydn: sptidentityentitlement=${uuids},ou=iiq,o=sources
modifyTimestamp: 20210726223618.235Z
objectclass: top
objectclass: vdIdentityIQidentityiqsptidentityentitlement
cacheModifyTimestamp: 20210726223618.235Z
sptidentityentitlement: ${uuids}
createTimestamp: 20210726223618.235Z
nativeidentity: usertest${nativeidentity}
application: ${application}
modifiersName: cn=Directory Manager
creatorsName: cn=Directory Manager
cacheModifiersName: cn=Directory Manager
id: ${uuids}
value: ims.${value}
identityid: ${identityid}
vsysacachemetadn: sptidentityentitlement=@,ou=iiq,o=sources
cacheCreateTimestamp: 20210726223618.235Z
name: groups
`;
    fs.writeFileSync(`./${fileName}_${max}.ldif`, content, { flag: 'a+' }, err => {})
    if(i%100000 == 0){
        console.log('Processed ',i,'of',max)
    }
    
}
