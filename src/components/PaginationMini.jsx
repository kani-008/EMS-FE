import assets from "../assets/assets";

const PaginationMini = ({ pageInput, totalPages, setPageInput }) => {
  const page = Number(pageInput) || 1;

  const goPrev = () => {
    if (page > 1) setPageInput(String(page - 1));
  };

  const goNext = () => {
    if (page < totalPages) setPageInput(String(page + 1));
  };

  const handleChange = (e) => {
    let val = e.target.value;

    if (val === "") {
      setPageInput("");
      return;
    }

    let num = Number(val);
    if (Number.isNaN(num)) return;

    if (num < 1) num = 1;
    if (num > totalPages) num = totalPages;

    setPageInput(String(num));
  };

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      {/* ◀ PREV */}
      <button
        onClick={goPrev}
        disabled={page <= 1}
        className="
          h-6 w-6
          flex items-center justify-center
          border border-slate-300 rounded-lg
          text-slate-500
          hover:bg-slate-100
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        <img src={assets.leftarrow_icon} alt="Previous" className="w-4 h-4" />
      </button>

      {/* PAGE INPUT */}
      <input
        type="number"
        min={1}
        max={totalPages}
        step={1}
        value={pageInput}
        onChange={handleChange}
        className="
          w-8 h-6 text-center
          border border-slate-400 rounded-lg
          outline-none
          focus:ring-1 focus:ring-blue-500
          focus:border-blue-500
        "
      />

      {/* ▶ NEXT */}
      <button
        onClick={goNext}
        disabled={page >= totalPages}
        className="
          h-6 w-6
          flex items-center justify-center
          border border-slate-300 rounded-lg
          text-slate-500
          hover:bg-slate-100
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        <img src={assets.right_icon} alt="Next" className="w-4 h-4" />
      </button>

      <span className={`ml-0 text-sm text-slate-500 font-semibold`}>
        Of {totalPages} pages
      </span>
    </div>
  );
};

export default PaginationMini;
