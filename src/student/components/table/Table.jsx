// frontend/src/student/components/table/Table.jsx
import CustomCheckbox from "../CustomCheckbox";

const Table = ({
  columns,
  data,
  actions,
  selectable = false,
  selectedIds = [],
  setSelectedIds,
  getRowId = (row) => row.userId,
}) => {
  const pageIds = data.map((row) => getRowId(row));

  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const someSelected =
    pageIds.some((id) => selectedIds.includes(id)) && !allSelected;

  const handleSelectAll = (checked) => {
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...pageIds]))
        : prev.filter((id) => !pageIds.includes(id))
    );
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🔒 hide content only
  const hideActions = selectable && selectedIds.length > 0;

  const thtext =
    "text-xs text-base uppercase tracking-wide text-slate-500";

  const totalCols =
    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);

  return (
    <div className="overflow-x-auto overflow-visible relative">
      <table className="w-full table-fixed border-separate border-spacing-y-3 text-sm -pr-2">
        <thead>
          <tr>
            <th colSpan={totalCols}>
              <div className="bg-white border border-slate-200 rounded-lg drop-shadow-lg mb-1 -mt-3">
                <table className="w-full table-fixed">
                  <colgroup>
                    {selectable && <col className="w-12" />}
                    {columns.map((col, i) => (
                      <col key={i} className={col.width} />
                    ))}
                    {actions && <col className="w-16" />}
                  </colgroup>

                  <thead>
                    <tr className={thtext}>
                      {selectable && (
                        <th className="px-4 py-3">
                          <CustomCheckbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={(e) =>
                              handleSelectAll(e.target.checked)
                            }
                          />
                        </th>
                      )}

                      {columns.map((col, i) => (
                        <th key={i} className="px-2 py-3 text-left">
                          {col.header}
                        </th>
                      ))}

                      {actions && (
                        <th className="px-4 py-3 text-right">
                          <span
                            style={{
                              visibility: hideActions
                                ? "hidden"
                                : "visible",
                            }}
                          >
                            ACTION
                          </span>
                        </th>
                      )}
                    </tr>
                  </thead>
                </table>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={getRowId(row) ?? index}>
              <td colSpan={totalCols}>
                <div className="bg-white border border-slate-200 drop-shadow rounded-lg -my-0.5 ml-0.5">
                  <table className="w-full table-fixed">
                    <colgroup>
                      {selectable && <col className="w-12" />}
                      {columns.map((col, i) => (
                        <col key={i} className={col.width} />
                      ))}
                      {actions && <col className="w-16" />}
                    </colgroup>

                    <tbody>
                      <tr>
                        {selectable && (
                          <td className="px-4 py-3">
                            <CustomCheckbox
                              checked={selectedIds.includes(
                                getRowId(row)
                              )}
                              onChange={() =>
                                handleSelectRow(getRowId(row))
                              }
                            />
                          </td>
                        )}

                        {columns.map((col, i) => (
                          <td
                            key={i}
                            className="px-2 py-3 whitespace-nowrap"
                          >
                            {col.render
                              ? col.render(row)
                              : row[col.accessor]}
                          </td>
                        ))}

                        {actions && (
                          <td className="px-4 py-3 text-right">
                            <span
                              style={{
                                visibility: hideActions
                                  ? "hidden"
                                  : "visible",
                              }}
                            >
                              {actions(row, index)}
                            </span>
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
