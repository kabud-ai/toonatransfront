// Factory that selects between SDK provider and REST provider
import sdkProvider from './providers/sdkProvider';
import restProvider from './providers/restProvider';

const providerName = import.meta.env.VITE_API_PROVIDER || 'base44';
const provider = providerName === 'rest' ? restProvider() : sdkProvider();

export default provider;

// Also export helper to get current provider name (useful for debugging)
export const providerNameActive = providerName;
