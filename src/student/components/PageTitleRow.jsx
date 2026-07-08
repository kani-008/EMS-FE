// frontend/src/student/components/PageTitleRow.jsx
import Button from "../../components/Button";

const colorMap = {
  blue: "text-blue-600",
  green: "text-green-800",
  red: "text-red-500",
};

const PageTitleRow = ({ title, onCreate, stats = [] }) => {
  return (
    <div
      className="
        flex items-center justify-between
        py-3
        bg-white
        border-b border-slate-300
        -mx-6
        -mb-2
        drop-shadow-sm
        
      "
    >
      <h2 className="pl-4 text-sm font-semibold text-slate-800">{title}</h2>

      <div className="flex items-center gap-3 mr-3  ">
        {onCreate && (
          <Button onClick={onCreate} variant="primaryCreate" label="Create" iconOnlyMobile={true} />
        )}
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="
      px-5 py-2
      border border-cyan-300
      rounded-lg
      bg-white
      min-w-[130px]
      text-center
    "
          >
            <span className={`${colorMap[item.color]} text-base font-medium`}>
              {item.value}
            </span>
            <span
              className={`${colorMap[item.color]} ml-1 text-sm font-bold opacity-200 `}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageTitleRow;
