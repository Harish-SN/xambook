import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'https://auth.xambook.com',
  realm: 'xambook',
  clientId: 'xambook-frontend',
})

export default keycloak