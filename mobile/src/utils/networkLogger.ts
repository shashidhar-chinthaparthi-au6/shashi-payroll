// Simple network monitoring without external dependencies
export const setupNetworkMonitoring = () => {
  console.log('🌐 Network monitoring initialized');
  
  // Monitor API calls for network issues
  const originalFetch = global.fetch;
  global.fetch = async (...args) => {
    try {
      console.log('📡 Fetch Request:', args[0]);
      const response = await originalFetch(...args);
      console.log('✅ Fetch Response:', response.status, response.statusText);
      return response;
    } catch (error) {
      console.log('❌ Fetch Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };
};

export const logNetworkError = (error: any, context: string) => {
  console.log(`🚨 Network Error in ${context}:`, {
    message: error.message,
    code: error.code,
    response: error.response?.data,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString()
  });
};

export const logAPICall = (method: string, url: string, data?: any) => {
  console.log(`📡 API Call: ${method.toUpperCase()} ${url}`, {
    data,
    timestamp: new Date().toISOString()
  });
};
