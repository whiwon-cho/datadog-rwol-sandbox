import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

let hasInitialized = false;

const getEnv = (key, fallback = undefined) => {
  const value = import.meta.env[key];
  return value != null && value !== '' ? value : fallback;
};

export const initializeDatadog = () => {
  if (hasInitialized) {
    return;
  }

  const applicationId = getEnv('REACT_APP_APP_ID_RUM');
  const clientToken = getEnv('REACT_APP_CLIENT_TOKEN_RUM');
  const site = getEnv('REACT_APP_DD_SITE');
  const version = getEnv('REACT_APP_VERSION');
  const service = getEnv('REACT_APP_DD_SERVICE', 'software-company-website');
  const environment = getEnv('REACT_APP_DD_ENV', import.meta.env.MODE);

  if (!applicationId || !clientToken || !site) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        'Datadog initialization skipped. Missing REACT_APP_* environment variables (applicationId, clientToken, site).',
      );
    }
    return;
  }

  const allowedTracingUrls = getEnv('REACT_APP_DD_ALLOWED_TRACING_URLS', '')
    ?.split(',')
    .map((url) => url.trim())
    .filter(Boolean);


  // Check if user already exists in sessionStorage
  let user;
  const storedUser = sessionStorage.getItem('dd_current_user');
  
  if (storedUser) {
    // Use existing user from sessionStorage
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      user = null;
    }
  }
  
  // If no valid user in sessionStorage, use default and save it
  if (!user) {
    user = {
      id: '100',
      name: 'Alex Smith',
      email: 'alex.smith@standard-user.com',
      plan: 'standard',
      hasPaid: false
    };

    // user = {
    //   id: '200',
    //   name: 'Whiwon Cho',
    //   email: 'whiwon@premium-user.com',
    //   plan: 'premium',
    //   hasPaid: true
    // };

    sessionStorage.setItem('dd_current_user', JSON.stringify(user));
  }

  datadogRum.init({
    applicationId: applicationId,
    clientToken: clientToken,
    site: site,
    service: service,
    env: environment,
    version: version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    startSessionReplayRecordingManually: false,
    trackResources: true,
    trackLongTasks: true,
    // defaultPrivacyLevel: 'mask-user-input',
    // allowedTracingUrls: allowedTracingUrls,
    allowedTracingUrls: ["https://dummyjson.com"],
  });

  datadogRum.setUser(user);
  datadogRum.setGlobalContextProperty('activity', {
    ab_test: 'group_a',
    cartValue: true,
    amount: 99.99
  });


  datadogLogs.init({
    clientToken: clientToken,
    site: site,
    forwardErrorsToLogs: true,
    forwardConsoleLogs: 'all',
    sessionSampleRate: 100,
    telemetrySampleRate: 100,
    service: service,
    env: environment,
    version: version,
  });

  hasInitialized = true;
};

