export function DataTable({
  data,
  columns,
  getRowClassName,
  tableWrapperClassName = "",
  className = "",
  headerClassName = "",
  rowClassName = "",
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 lg:py-12 text-slate-500">
        <p className="text-sm lg:text-base">No data available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="table-wrapper w-full overflow-x-auto">
        <table className="table-full-width border-collapse min-w-full">
          <thead className={`bg-slate-50 sticky top-0 z-20 ${headerClassName}`}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={`px-2 lg:px-3 py-2 lg:py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b-2 border-slate-200 bg-slate-50 ${
                    column.className || ""
                  } ${
                    index === 0
                      ? "col-name"
                      : column.key.toLowerCase().includes("level") || column.key.toLowerCase().includes("current")
                        ? "col-progress"
                        : typeof data[0]?.[column.key] === "number"
                          ? "col-number"
                          : "col-status"
                  }`}
                  style={{
                    width:
                      index === 0
                        ? "25%"
                        : column.key.toLowerCase().includes("level") || column.key.toLowerCase().includes("current")
                          ? "20%"
                          : typeof data[0]?.[column.key] === "number"
                            ? "12%"
                            : `${Math.floor(75 / (columns.length - 1))}%`,
                    minWidth: index === 0 ? "120px" : "80px", // Minimum widths for mobile
                  }}
                >
                  <span className="hidden sm:inline">{column.header}</span>
                  <span className="sm:hidden">
                    {column.header.length > 8 ? column.header.substring(0, 8) + "..." : column.header}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150 ${
                  getRowClassName ? getRowClassName(row) : ""
                } ${rowClassName}`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={`px-2 lg:px-3 py-2 lg:py-3 text-xs lg:text-sm ${column.className || ""} ${colIndex === 0 ? "font-medium" : ""}`}
                    style={{
                      width:
                        colIndex === 0
                          ? "25%"
                          : column.key.toLowerCase().includes("level") || column.key.toLowerCase().includes("current")
                            ? "20%"
                            : typeof row[column.key] === "number"
                              ? "12%"
                              : `${Math.floor(75 / (columns.length - 1))}%`,
                      minWidth: colIndex === 0 ? "120px" : "80px",
                    }}
                  >
                    <div className="overflow-hidden text-ellipsis">
                      {column.cell ? column.cell(row) : row[column.key]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
