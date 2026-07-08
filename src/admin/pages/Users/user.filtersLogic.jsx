// frontend/src/admin/pages/Users/user.filtersLogic.jsx
// (also used from staff/pages/Users/ — same logic)

/**
 * Filter users table data against active filter selections.
 *
 * Key alignment with UserManagement.jsx fetchUsers():
 *   row.userRole  → normalizeRole() result e.g. "Faculty", "Student", "Advisor"
 *   row.course    → normalizeCourse() result e.g. "B.E", "M.E", "-"
 *   row.current_year → raw INT from DB e.g. 1, 2, 3, 4 (0 = not set)
 *   row.semester  → raw INT from DB e.g. 1..8 (null = not set)
 *   row.status    → always uppercase "ACTIVE" | "INACTIVE"
 */
export const filterUsers = (data, filters) => {
  return data.filter((row) => {

    // ── Role filter ───────────────────────────────────────────────────────
    // row.userRole is title-cased by normalizeRole() → "Faculty", "Student", etc.
    if (filters.role?.length && !filters.role.includes(row.userRole)) {
      return false;
    }

    // ── Course filter ─────────────────────────────────────────────────────
    // row.course is preserved as-is → "B.E", "M.E", or "-"
    if (filters.course?.length && !filters.course.includes(row.course)) {
      return false;
    }

    // ── Year filter ───────────────────────────────────────────────────────
    // Filters compare as strings; row.current_year is INT from DB.
    // Students don't have current_year in DB — they use the spread value
    // from getUsersService which maps it as u.current_year (could be null).
    // We also fall back to row.year (set by ...u spread from service's year field).
    if (filters.year?.length) {
      const yearVal = row.current_year ?? row.year ?? null;
      if (!filters.year.includes(String(yearVal))) return false;
    }

    // ── Semester filter ───────────────────────────────────────────────────
    // row.semester is INT or null from DB
    if (filters.semester?.length) {
      if (!filters.semester.includes(String(row.semester ?? ""))) return false;
    }

    // ── Status filter ─────────────────────────────────────────────────────
    // row.status is always "ACTIVE" or "INACTIVE" (uppercase)
    // FilterBar should send uppercase values to match
    if (filters.status?.length) {
      const rowStatus = String(row.status || "").toUpperCase();
      const filterStatuses = filters.status.map((s) => String(s).toUpperCase());
      if (!filterStatuses.includes(rowStatus)) return false;
    }

    return true;
  });
};