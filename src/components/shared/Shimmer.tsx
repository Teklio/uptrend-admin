export const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ backgroundColor: "rgba(0,0,0,0.06)" }} />
);

export const MainLayoutShimmer = () => (
  <div className="flex h-screen w-screen items-center justify-center" style={{ backgroundColor: "#f4f4f4" }}>
    <div
      className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
      style={{ borderColor: "#002b7f", borderTopColor: "transparent" }}
    />
  </div>
);

export const TableShimmer = ({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <td key={colIndex} className="px-4 py-3">
            <Shimmer className="h-4 w-full" />
          </td>
        ))}
      </tr>
    ))}
  </>
);
