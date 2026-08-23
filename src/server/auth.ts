export type UserRole = "citizen" | "admin";

export interface AuthContext {
  userId: string;
  name: string;
  role: UserRole;
  department?: string | undefined;
  authenticated: boolean;
}

/**
 * Get the current user context.
 * Supports both Citizen and Admin sessions.
 */
export function getCurrentUser(role: UserRole = "citizen"): AuthContext {
  if (role === "admin") {
    return {
      userId: "admin-officer-001",
      name: "Dr. K. Srinivas Rao",
      role: "admin",
      department: "Ministry of Social Justice & Welfare",
      authenticated: true,
    };
  }

  return {
    userId: "demo-user-001",
    name: "Aarav Reddy",
    role: "citizen",
    authenticated: true,
  };
}

/**
 * Verify that the user is authenticated.
 * Throws if not authenticated.
 */
export function requireAuth(role: UserRole = "citizen"): AuthContext {
  const user = getCurrentUser(role);
  if (!user.authenticated) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Verify that the user has admin role privileges.
 * Throws if not an administrator.
 */
export function requireAdmin(): AuthContext {
  const user = getCurrentUser("admin");
  if (!user.authenticated || user.role !== "admin") {
    throw new Error("Administrator privileges required");
  }
  return user;
}
