export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  pollingIntervalVitals: 5000,
  pollingIntervalDashboard: 10000,
  azure: {
    clientId: 'TU_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/TU_TENANT_ID',
    redirectUri: 'http://localhost:4200',
    scopes: ['openid', 'profile', 'email', 'api://BFF_CLIENT_ID/access_as_user']
  }
};
