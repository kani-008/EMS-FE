// frontend/src/staff/pages/Users/user.filtersLogic.jsx
export const filterUsers = (data, filters) => {
  return data.filter((row) => {
    if (filters.role?.length && !filters.role.includes(row.userRole)) {
      return false;
    }

    if (filters.course?.length && !filters.course.includes(row.course)) {
      return false;
    }

    if (filters.year?.length && !filters.year.includes(String(row.year))) {
      return false;
    }

    if (
      filters.semester?.length &&
      !filters.semester.includes(String(row.semester))
    ) {
      return false;
    }

    if (filters.status?.length && !filters.status.includes(row.status)) {
      return false;
    }

    return true;
  });
};
