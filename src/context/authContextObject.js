import { createContext } from "react";

// Shared context object — imported by AuthContext.jsx (Provider) and useAuth.js (hook)
export const AuthContext = createContext(null);
