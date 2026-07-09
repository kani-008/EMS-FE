// frontend/src/apiCall/Api.jsx

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "API request failed");
  }
  return data;
};

// Generic api fetch helper
const apiFetch = async (url, options = {}) => {
  const headers = {
    ...options.headers,
  };
  
  // If not sending FormData, default to JSON headers
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });
  return handleResponse(res);
};

/* ── AUTH API ────────────────────────────────────────────────────────────── */
export const loginUser = async ({ username, password }) => {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

export const logoutUser = async () => {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
};

export const getMe = async () => {
  return apiFetch("/api/auth/me");
};

/* ── ADMIN USER MANAGEMENT API ────────────────────────────────────────────── */
export const fetchAdminUsers = async () => {
  return apiFetch("/api/admin/users");
};

export const getDepartments = async () => {
  return apiFetch("/api/admin/departments");
};

export const getStaffRoles = async () => {
  return apiFetch("/api/admin/staff-roles");
};

export const validateBatch = async (batch, course) => {
  return apiFetch(
    `/api/admin/validate-batch?batch=${encodeURIComponent(batch)}&course=${encodeURIComponent(course)}`
  );
};

export const createAdminUsers = async (payload) => {
  return apiFetch("/api/admin/create-users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const createStaff = async (payload) => {
  return apiFetch("/api/admin/create-staff", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const uploadStaffExcel = async (formData) => {
  return apiFetch("/api/admin/upload-staff-excel", {
    method: "POST",
    body: formData,
  });
};

export const updateStaff = async (userId, payload) => {
  return apiFetch(`/api/admin/update-staff/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

/* ── ADMIN PROFILE API ────────────────────────────────────────────────────── */
export const fetchAdminProfile = async () => {
  return apiFetch("/api/admin/profile");
};

export const updateAdminProfile = async (payload) => {
  return apiFetch("/api/admin/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

/* ── STAFF ADVISOR & STUDENT MANAGEMENT API ───────────────────────────────── */
export const fetchAdvisorContext = async () => {
  return apiFetch("/api/staff/advisor-context");
};

export const fetchStaffStudents = async () => {
  return apiFetch("/api/staff/students");
};

export const createStudentRange = async (payload) => {
  return apiFetch("/api/staff/students/range", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const createSingleStudent = async (payload) => {
  return apiFetch("/api/staff/students/single", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const uploadStudentExcel = async (formData) => {
  return apiFetch("/api/staff/students/excel", {
    method: "POST",
    body: formData,
  });
};

export const updateStudent = async (rollNo, payload) => {
  return apiFetch(`/api/staff/students/${rollNo}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

/* ── STAFF PROFILE API ────────────────────────────────────────────────────── */
export const fetchStaffProfile = async () => {
  return apiFetch("/api/staff/profile");
};

export const updateStaffProfile = async (payload) => {
  return apiFetch("/api/staff/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

/* ── STUDENT PROFILE API ──────────────────────────────────────────────────── */
export const fetchStudentProfile = async () => {
  return apiFetch("/api/student/profile");
};

export const updateStudentProfile = async (payload) => {
  return apiFetch("/api/student/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const updateStudentPassword = async (payload) => {
  return apiFetch("/api/student/profile/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};
