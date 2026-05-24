import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import keycloak from './keycloak'
import './index.css'
import App from './App.tsx'

keycloak.init({
  onLoad: 'check-sso',           // don't force login on page load
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256',            // security best practice
}).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App keycloak={keycloak} />
      </BrowserRouter>
    </StrictMode>
  )
})