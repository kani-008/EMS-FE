// frontend/src/staff/pages/Requests/request.filtersLogice.jsx
export const filterRequests = (data, filters) => {
  return data.filter((row) => {
    // COURSE (checkbox = array)
    if (filters.course?.length && !filters.course.includes(row.course)) {
      return false;
    }

    // YEAR
    if (filters.year?.length && !filters.year.includes(String(row.year))) {
      return false;
    }

    // REQUEST CATEGORY
    if (
      filters.category?.length &&
      !filters.category.includes(row.requestCategory)
    ) {
      return false;
    }

    // STATUS
    if (filters.status?.length && !filters.status.includes(row.status)) {
      return false;
    }

    return true;
  });
};
