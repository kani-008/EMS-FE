import client from "./client";

export const fetchStudentProfile = () => client.get("/api/student/profile");

export const updateStudentProfile = (payload) => client.put("/api/student/profile", payload);

export const updateStudentPassword = (payload) => client.put("/api/student/profile/password", payload);
