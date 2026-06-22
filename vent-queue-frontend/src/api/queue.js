import axios from "axios";

const BASE_URL = "http://localhost:8000";

// Customer joins queue
export const joinQueue = async (shopId, name, phone, partySize) => {
  const response = await axios.post(`${BASE_URL}/queue/${shopId}/join`, {
    name,
    phone,
    party_size: partySize,
  });
  return response.data;
};

// Customer checks their position
export const checkStatus = async (shopId, entryId) => {
  const response = await axios.get(
    `${BASE_URL}/queue/${shopId}/status/${entryId}`
  );
  return response.data;
};

// Owner gets full queue
export const getOwnerQueue = async (shopId) => {
  const response = await axios.get(`${BASE_URL}/owner/${shopId}/queue`);
  return response.data;
};

// Owner notifies customer
export const notifyCustomer = async (shopId, entryId) => {
  const response = await axios.post(
    `${BASE_URL}/owner/${shopId}/notify/${entryId}`
  );
  return response.data;
};

// Owner seats customer
export const seatCustomer = async (shopId, entryId) => {
  const response = await axios.post(
    `${BASE_URL}/owner/${shopId}/seat/${entryId}`
  );
  return response.data;
};

// Owner removes customer
export const removeCustomer = async (shopId, entryId) => {
  const response = await axios.post(
    `${BASE_URL}/owner/${shopId}/remove/${entryId}`
  );
  return response.data;
};