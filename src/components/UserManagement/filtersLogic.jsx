// frontend/src/components/UserManagement/filtersLogic.jsx
export const filterUsers = (data, filters) => {
  return data.filter((row) => {
    // Role filter
    if (filters.role?.length && !filters.role.includes(row.userRole)) {
      return false;
    }

    // Course filter
    if (filters.course?.length && !filters.course.includes(row.course)) {
      return false;
    }

    // Year filter (standardized comparison to check both current_year and year)
    if (filters.year?.length) {
      const yearVal = row.current_year ?? row.year ?? null;
      if (!filters.year.includes(String(yearVal))) {
        return false;
      }
    }

    // Semester filter
    if (filters.semester?.length) {
      const semVal = row.semester ?? null;
      if (!filters.semester.includes(String(semVal))) {
        return false;
      }
    }

    // Batch filter
    if (filters.batch?.length && !filters.batch.includes(row.batch)) {
      return false;
    }

    // Status filter (case-insensitive checks)
    if (filters.status?.length) {
      const rowStatus = String(row.status || "").toUpperCase();
      const filterStatuses = filters.status.map((s) => String(s).toUpperCase());
      if (!filterStatuses.includes(rowStatus)) {
        return false;
      }
    }

    return true;
  });
};
