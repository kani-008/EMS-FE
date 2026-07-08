// frontend/src/student/components/filter/FilterBar.jsx
import { useState } from "react";
import DateTimeDropdown from "../../components/DateTimeDropdown";
import CheckboxDropdown from "./CheckboxDropdown";
import { tableHeadText } from "../../../styles/tableHeadText";
import assets from "../../../assets/assets";

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

        {/* LEFT */}
        <div className="flex items-center gap-3">
          {children}

          {type === "request" && (
            <>
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

          <button
            onClick={() => {
              setFromDate(getDefaultFromDate());
              setToDate(getDefaultToDate());
              onReset?.();
            }}
            className="px-2 py-1 border border-slate-300 text-sm text-slate-500 font-semibold rounded-md bg-white"
          >
            Reset
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 w-[520px] justify-end  -py-1">
          {selectedIds.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setActionOpen((p) => !p)}
                className="px-2 py-1 border border-slate-400 rounded-lg bg-white flex items-center gap-2 text-sm font-semibold text-slate-600"
              >
                Action <span className="text-slate-400">▾</span>
              </button>

              {actionOpen && (
                <div className="absolute right-0 mt-3 w-24 bg-white border rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      onBulkAction?.("delete");
                      setActionOpen(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <img src={assets.delete_icon} className="w-5 h-6" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={` -py-0.5 tableHeadText`}>
  <DateTimeDropdown
    label="From"
    value={fromDate}
    onChange={setFromDate}
    align="left"
  />
</div>

<div className={` -py-0.5 tableHeadText`}>
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
