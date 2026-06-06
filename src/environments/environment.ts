export const environment = {
  production: false,
  apiUrl: 'http://54.210.62.242:8080/api',
  pollingIntervalVitals: 5000,
  pollingIntervalDashboard: 10000,
  azure: {
    clientId: '765a73b2-5568-41b3-a9a4-2d865745b67c',
    authority: 'https://login.microsoftonline.com/334d911e-3379-464e-a4fe-83cbd4fcdad3',
    redirectUri: 'http://localhost:4200',
    scopes: [
      'openid',
      'profile',
      'email',
      'api://765a73b2-5568-41b3-a9a4-2d865745b67c/.default'
    ]
  }
};
