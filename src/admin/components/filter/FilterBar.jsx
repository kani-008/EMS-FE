// frontend/src/staff/components/filter/FilterBar.jsx

import { useState } from "react";
import DateTimeDropdown from "../../components/DateTimeDropdown";
import CheckboxDropdown from "./CheckboxDropdown";
import { tableHeadText } from "../../../styles/tableHeadText";

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
}) => {
  const [fromDate, setFromDate] = useState(getDefaultFromDate);
  const [toDate, setToDate] = useState(getDefaultToDate);
  const [actionOpen, setActionOpen] = useState(false);

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
      <CheckboxDropdown
        label="User Role"
        options={["Student", "Staff"]}
        value={filters.role || []}
        onChange={(v) =>
          setFilters({ ...filters, role: v })
        }
      />

      <CheckboxDropdown
        label="Course"
        options={["B.E", "M.E"]}
        value={filters.course || []}
        onChange={(v) =>
          setFilters({ ...filters, course: v })
        }
      />

      <CheckboxDropdown
        label="Year"
        options={["1", "2", "3", "4"]}
        value={filters.year || []}
        onChange={(v) =>
          setFilters({ ...filters, year: v })
        }
      />

      <CheckboxDropdown
        label="Semester"
        options={["1", "2"]}
        value={filters.semester || []}
        onChange={(v) =>
          setFilters({ ...filters, semester: v })
        }
      />

      <CheckboxDropdown
        label="Status"
        options={["Active", "Inactive"]}
        value={filters.status || []}
        onChange={(v) =>
          setFilters({ ...filters, status: v })
        }
      />
    </>
  )}

  {/* REQUEST MANAGEMENT FILTERS */}
  {type === "request" && (
    <>
      <CheckboxDropdown
        label="Course"
        options={["B.E", "M.E"]}
        value={filters.course || []}
        onChange={(v) =>
          setFilters({ ...filters, course: v })
        }
      />

      <CheckboxDropdown
        label="Year"
        options={["1", "2", "3", "4"]}
        value={filters.year || []}
        onChange={(v) =>
          setFilters({ ...filters, year: v })
        }
      />

      <CheckboxDropdown
        label="Request Category"
        options={["Leave", "Paper Presentation", "Sports"]}
        value={filters.category || []}
        onChange={(v) =>
          setFilters({ ...filters, category: v })
        }
      />

      <CheckboxDropdown
        label="Status"
        options={["Pending", "Accepted", "Rejected"]}
        value={filters.status || []}
        onChange={(v) =>
          setFilters({ ...filters, status: v })
        }
      />
    </>
  )}

  {/* Reset */}
  <button
    onClick={onReset}
    className="px-2 py-0.5 border border-slate-400 text-sm text-slate-500 font-semibold rounded-lg bg-white"
  >
    Reset
  </button>
</div>


        {/* RIGHT — ACTION / DATE */}
        <div className="flex items-center  justify-end gap-4  w-[520px] shrink-0">
          {selectedIds.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setActionOpen((p) => !p)}
                className={`
                  px-1 py-0.5 border border-slate-400 rounded-lg
                  bg-white flex items-center gap-2 text-sm text-slate-500 font-semibold
                `}
              >
                Action
                <span className="text-slate-400">▾</span>
              </button>

              {actionOpen && (
                <div className="absolute -ml-8 mt-2 w-max bg-white border rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      onBulkAction("Activate");
                      setActionOpen(false);
                    }}
                    className="w-full px-4 py-2 text-justify text-slate-500 font-semibold text-sm hover:bg-slate-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => {
                      onBulkAction("Inactivate");
                      setActionOpen(false);
                    }}
                    className="w-full px-4 py-2 text-justify text-sm text-slate-500 font-semibold hover:bg-slate-200"
                  >
                    Inactivate
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={` -py-0.5 ${tableHeadText}`}>
                <DateTimeDropdown
                  label="From"
                  value={fromDate}
                  onChange={setFromDate}
                  align="left"
                />
              </div>
              
              <div className={` -py-0.5 ${tableHeadText}`}>
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
