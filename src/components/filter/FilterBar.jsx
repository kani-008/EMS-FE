// frontend/src/components/filter/FilterBar.jsx
import { useState, useEffect } from "react";
import DateTimeDropdown from "../DateTimeDropdown";
import CheckboxDropdown from "./CheckboxDropdown";
import { useAuth } from "../../components/AuthContext";
import assets from "../../../src/assets/assets";
import API from "../../ApiCall/Api";
import { getCachedData } from "../../ApiCall/cache";

const getDefaultToDate = () => new Date();

const getDefaultFromDate = () => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  );
};

const FilterBar = ({
  type = "request",
  children,
  filters,
  setFilters,
  onReset,
  selectedIds = [],
  onBulkAction,
  batches = [],
}) => {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "ADMIN";
  const isStudent = role === "STUDENT";
  const isStaff = !isAdmin && !isStudent;

  const [fromDate, setFromDate] = useState(getDefaultFromDate);
  const [toDate, setToDate] = useState(getDefaultToDate);
  const [actionOpen, setActionOpen] = useState(false);

  const [dbOptions, setDbOptions] = useState({
    courses: ["B.E", "M.E"],
    years: ["1", "2", "3", "4"],
    semesters: ["1", "2", "3", "4", "5", "6", "7", "8"],
    statuses: ["Active", "Inactive"],
    roles: ["Student", "Staff"]
  });

  useEffect(() => {
    if (type === "user" || type === "request") {
      const fetchOptions = async () => {
        try {
          const data = await getCachedData("filterOptions", "/users/filter-options");
          if (data) {
            setDbOptions(data);
          }
        } catch (err) {
          console.error("Failed to load filter options from server:", err);
        }
      };
      fetchOptions();
    }
  }, [type]);

  const semesterOptions = (() => {
    const list = dbOptions.semesters || ["1", "2", "3", "4", "5", "6", "7", "8"];
    if (isAdmin) return list.filter(s => s === "1" || s === "2");
    const selectedYears = filters.year || [];
    if (selectedYears.length === 1) {
      const yr = selectedYears[0];
      if (yr === "1") return list.filter(s => s === "1" || s === "2");
      if (yr === "2") return list.filter(s => s === "3" || s === "4");
      if (yr === "3") return list.filter(s => s === "5" || s === "6");
      if (yr === "4") return list.filter(s => s === "7" || s === "8");
    }
    return list;
  })();

  return (
    <div className="px-4 py-3 pb-0 -mx-6">
      <div className="flex items-center justify-between w-full">
        {/* LEFT — Pagination + Filters */}
        <div className="flex items-center gap-3 mr-6">
          {/* Pagination */}
          {children}

          {/* USER MANAGEMENT FILTERS */}
          {type === "user" && (
            <>
              {isAdmin && (
                <CheckboxDropdown
                  label="User Role"
                  options={dbOptions.roles}
                  value={filters.role || []}
                  onChange={(v) => setFilters({ ...filters, role: v })}
                />
              )}

              <CheckboxDropdown
                label="Course"
                options={dbOptions.courses}
                value={filters.course || []}
                onChange={(v) => setFilters({ ...filters, course: v })}
              />

              <CheckboxDropdown
                label="Year"
                options={dbOptions.years}
                value={filters.year || []}
                onChange={(newYears) => {
                  if (isAdmin) {
                    setFilters({ ...filters, year: newYears });
                  } else {
                    let newSemOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
                    if (newYears.length === 1) {
                      const yr = newYears[0];
                      if (yr === "1") newSemOptions = ["1", "2"];
                      else if (yr === "2") newSemOptions = ["3", "4"];
                      else if (yr === "3") newSemOptions = ["5", "6"];
                      else if (yr === "4") newSemOptions = ["7", "8"];
                    }
                    const currentSems = filters.semester || [];
                    const validSems = currentSems.filter((sem) => newSemOptions.includes(sem));
                    setFilters({
                      ...filters,
                      year: newYears,
                      semester: validSems,
                    });
                  }
                }}
              />

              <CheckboxDropdown
                label="Semester"
                options={semesterOptions}
                value={filters.semester || []}
                onChange={(v) => setFilters({ ...filters, semester: v })}
              />

              {isStaff && batches.length > 0 && (
                <CheckboxDropdown
                  label="Batch"
                  options={batches}
                  value={filters.batch || []}
                  onChange={(v) => setFilters({ ...filters, batch: v })}
                />
              )}

              <CheckboxDropdown
                label="Status"
                options={dbOptions.statuses}
                value={filters.status || []}
                onChange={(v) => setFilters({ ...filters, status: v })}
              />
            </>
          )}

          {/* REQUEST MANAGEMENT FILTERS */}
          {type === "request" && (
            <>
              {!isStudent && (
                <>
                  <CheckboxDropdown
                    label="Course"
                    options={dbOptions.courses}
                    value={filters.course || []}
                    onChange={(v) => setFilters({ ...filters, course: v })}
                  />

                  <CheckboxDropdown
                    label="Year"
                    options={dbOptions.years}
                    value={filters.year || []}
                    onChange={(v) => setFilters({ ...filters, year: v })}
                  />
                </>
              )}

              <CheckboxDropdown
                label="Request Category"
                options={["Leave", "Paper Presentation", "Sports"]}
                value={filters.category || []}
                onChange={(v) => setFilters({ ...filters, category: v })}
              />

              <CheckboxDropdown
                label="Status"
                options={["Pending", "Accepted", "Rejected"]}
                value={filters.status || []}
                onChange={(v) => setFilters({ ...filters, status: v })}
              />
            </>
          )}

          {/* Reset */}
          <button
            onClick={() => {
              setFromDate(getDefaultFromDate());
              setToDate(getDefaultToDate());
              onReset?.();
            }}
            className="px-2 py-0.5 border border-slate-400 text-sm text-slate-500 font-semibold rounded-lg bg-white"
          >
            Reset
          </button>
        </div>

        {/* RIGHT — ACTION / DATE */}
        <div className="flex items-center justify-end gap-4 w-[520px] shrink-0">
          {selectedIds.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setActionOpen((p) => !p)}
                className="px-2 py-1 border border-slate-400 rounded-lg bg-white flex items-center gap-2 text-sm font-semibold text-slate-600"
              >
                Action <span className="text-slate-400">▾</span>
              </button>

              {actionOpen && (
                <div className="absolute right-0 mt-3 w-max bg-white border rounded-md shadow-lg z-50">
                  {(isAdmin || isStaff) && type === "user" && (
                    <>
                      <button
                        onClick={() => {
                          onBulkAction?.("Activate");
                          setActionOpen(false);
                        }}
                        className="w-full px-4 py-2 text-justify text-slate-500 font-semibold text-sm hover:bg-slate-200"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => {
                          onBulkAction?.("Inactivate");
                          setActionOpen(false);
                        }}
                        className="w-full px-4 py-2 text-justify text-sm text-slate-500 font-semibold hover:bg-slate-200"
                      >
                        Inactivate
                      </button>
                    </>
                  )}
                  {isStudent && type === "request" && (
                    <button
                      onClick={() => {
                        onBulkAction?.("delete");
                        setActionOpen(false);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <img src={assets.delete_icon} className="w-5 h-6" alt="Delete" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="table-head-text -py-0.5">
                <DateTimeDropdown
                  label="From"
                  value={fromDate}
                  onChange={setFromDate}
                  align="left"
                />
              </div>

              <div className="table-head-text -py-0.5">
                <DateTimeDropdown
                  label="To"
                  value={toDate}
                  onChange={setToDate}
                  align="right"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
