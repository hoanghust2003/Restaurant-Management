/**
 * Utility for adding retry functionality to API calls
 */

interface RetryConfig {
  retries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
  statusCodesToRetry: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3, // Maximum number of retry attempts
  initialDelay: 300, // Initial delay in ms
  maxDelay: 3000, // Maximum delay in ms
  factor: 2, // Exponential backoff factor
  statusCodesToRetry: [408, 429, 500, 502, 503, 504] // Status codes eligible for retry
};

/**
 * Wraps a promise with retry logic
 * @param fn Function that returns a Promise
 * @param config Retry configuration options
 * @returns A Promise that will retry on failure
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry for network errors or specific status codes
      const shouldRetry = !error.response || 
        (error.response && retryConfig.statusCodesToRetry.includes(error.response.status));
      
      if (attempt >= retryConfig.retries || !shouldRetry) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.factor, attempt),
        retryConfig.maxDelay
      );
      
      // Add some jitter to prevent all clients retrying at exactly the same time
      const jitter = Math.random() * 100;
      
      console.debug(`API call failed, retrying in ${Math.round(delay + jitter)}ms (attempt ${attempt + 1}/${retryConfig.retries})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  // If we got here, all retries failed
  throw lastError;
}
