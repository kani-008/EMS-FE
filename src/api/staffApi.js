import client from "./client";

export const fetchAdvisorContext = () => client.get("/api/staff/advisor-context");

export const fetchStaffStudents = () => client.get("/api/staff/students");

export const updateStudent = (rollNo, payload) => client.put(`/api/staff/students/${rollNo}`, payload);

export const createStudentRange = (payload) => client.post("/api/staff/students/range", payload);

export const createSingleStudent = (payload) => client.post("/api/staff/students/single", payload);

export const uploadStudentExcel = (formData) => client.post("/api/staff/students/excel", formData);

export const fetchStaffProfile = () => client.get("/api/staff/profile");

export const updateStaffProfile = (payload) => client.put("/api/staff/profile", payload);
