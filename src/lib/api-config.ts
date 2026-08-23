/**
 * Future backend integration point.
 * Set VITE_API_BASE_URL to point the service layer at a real REST API.
 * Never place credentials or secrets in frontend code.
 */
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "";

export const IS_MOCK_MODE = API_BASE_URL === "";
