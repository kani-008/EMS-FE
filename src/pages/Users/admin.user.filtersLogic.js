export const filterUsers = (data, filters) => {
  return data.filter((row) => {

    // ── Role filter ───────────────────────────────────────────────────────
    if (filters.role?.length && !filters.role.includes(row.userRole)) {
      return false;
    }

    // ── Course filter ─────────────────────────────────────────────────────
    if (filters.course?.length && !filters.course.includes(row.course)) {
      return false;
    }

    // ── Year filter ───────────────────────────────────────────────────────
    if (filters.year?.length) {
      const yearVal = row.current_year ?? row.year ?? null;
      if (!filters.year.includes(String(yearVal))) return false;
    }

    // ── Semester filter ───────────────────────────────────────────────────
    if (filters.semester?.length) {
      if (!filters.semester.includes(String(row.semester ?? ""))) return false;
    }

    // ── Status filter ─────────────────────────────────────────────────────
    if (filters.status?.length) {
      const rowStatus = String(row.status || "").toUpperCase();
      const filterStatuses = filters.status.map((s) => String(s).toUpperCase());
      if (!filterStatuses.includes(rowStatus)) return false;
    }

    return true;
  });
};
