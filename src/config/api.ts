export const API_URL = '/api/backend';

export const API_ENDPOINTS = {
  items: `${API_URL}/items/`,
  vendors: `${API_URL}/vendors/`,
  productSpecs: (itemId: string) => `${API_URL}/product-specifications/${itemId}`,
  productSpecsBase: `${API_URL}/product-specifications/`,
  commercialParams: `${API_URL}/commercial-parameters/`,
  userAccess: `${API_URL}/useraccess/`,
};
