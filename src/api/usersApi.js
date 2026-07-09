import client from "./client";

export const fetchAdminUsers = () => client.get("/api/admin/users");

export const createAdminUsers = (payload) => client.post("/api/admin/create-users", payload);

export const updateStaff = (userId, payload) => client.put(`/api/admin/update-staff/${userId}`, payload);

export const getDepartments = () => client.get("/api/admin/departments");

export const getStaffRoles = () => client.get("/api/admin/staff-roles");

export const validateBatch = (batch, course) =>
  client.get(`/api/admin/validate-batch?batch=${encodeURIComponent(batch)}&course=${encodeURIComponent(course)}`);

export const createStaff = (payload) => client.post("/api/admin/create-staff", payload);

export const uploadStaffExcel = (formData) => client.post("/api/admin/upload-staff-excel", formData);

export const fetchAdminProfile = () => client.get("/api/admin/profile");

export const updateAdminProfile = (payload) => client.put("/api/admin/profile", payload);
