const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper function for HTTP requests to the backend API
 */
async function fetchAPI(endpoint, options = {}) {
  const { headers = {}, ...customOptions } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Attach token if present in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('droplink_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...customOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const productService = {
  /** Fetch all products with filter/pagination options */
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/products${queryString ? `?${queryString}` : ''}`);
  },

  /** Get single product by ID or Slug */
  getProductByIdOrSlug: (idOrSlug) => {
    return fetchAPI(`/products/${idOrSlug}`);
  },

  /** Get current supplier's products */
  getMyProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/products/supplier/my-products${queryString ? `?${queryString}` : ''}`);
  },

  /** Create a new product */
  createProduct: (productData) => {
    return fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  /** Update an existing product */
  updateProduct: (id, productData) => {
    return fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  /** Quick update product stock */
  updateStock: (id, stock, operation = 'set') => {
    return fetchAPI(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock, operation }),
    });
  },

  /** Admin approve/reject product */
  updateApproval: (id, isApproved) => {
    return fetchAPI(`/products/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    });
  },

  /** Delete a product */
  deleteProduct: (id) => {
    return fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
