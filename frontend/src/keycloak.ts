import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'https://auth.xambook.com',      // your Keycloak server URL
  realm: 'xambook',                      // your realm name
  clientId: 'xambook-frontend',          // your client ID
})

export default keycloak