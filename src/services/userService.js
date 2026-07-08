// frontend/src/services/userService.js
/**
 * ⚠️ DEPRECATED: Mock service removed.
 * All user data should be fetched from the backend API:
 * - GET /api/admin/users (for admin dashboard)
 * - POST /api/admin/create-users (for creating students)
 * - POST /api/admin/create-staff (for creating staff)
 * 
 * Do NOT use this file. Use fetch() with credentials: "include"
 */

export const userService = {
  // DEPRECATED - do not use
  getAll: () => Promise.reject(new Error("Mock service deprecated. Use API instead.")),
  getById: (id) => Promise.reject(new Error("Mock service deprecated. Use API instead.")),
  create: (data) => Promise.reject(new Error("Mock service deprecated. Use API instead.")),
  update: (id, data) => Promise.reject(new Error("Mock service deprecated. Use API instead."))
};
