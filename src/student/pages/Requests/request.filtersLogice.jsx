// frontend/src/student/pages/Requests/request.filtersLogice.jsx
export const filterRequests = (data, filters) => {
  return data.filter((row) => {

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
