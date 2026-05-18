import axios from 'axios';

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

function createClient(baseURL) {
  return axios.create({
    baseURL,
    headers: defaultHeaders,
    timeout: 5000
  });
}

export const userClient = createClient('http://localhost:8081/api/users');
export const medicineClient = createClient('http://localhost:8082/api/medicines');
export const orderClient = createClient('http://localhost:8083/api/orders');

export function extractEnvelope(response) {
  const payload = response?.data;

  if (!payload?.success) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload.data;
}

export function extractApiError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to reach the service. Fallback data loaded.'
  );
}

// Made with Bob
