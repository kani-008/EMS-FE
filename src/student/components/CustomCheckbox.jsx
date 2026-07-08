// frontend/src/student/components/CustomCheckbox.jsx
import assets from "../../assets/assets";

const SIZE_MAP = {
  sm: {
    box: "w-5 h-5",
    tick: "w-10 h-8 mt-1",
  },
  md: {
    box: "w-5 h-5",
    tick: "w-12 h-10 mt-1",
  },
};

const CustomCheckbox = ({ checked, onChange, size = "md" }) => {
  const { box, tick } = SIZE_MAP[size];

  return (
    <label className="flex items-center justify-center cursor-pointer select-none">
      {/* Native checkbox (logic only) */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />

      {/* Checkbox UI */}
      <span
        className={`
          ${box}
          flex items-center justify-center
          rounded-[3px]
          border
          transition-colors duration-150
          ${
            checked
              ? "bg-blue-600 border-blue-600"
              : "bg-white border-slate-300"
          }
        `}
      >
        {checked && (
          <img
            src={assets.bentick_icon}
            alt="checked"
            className={`${tick}`}
          />
        )}
      </span>
    </label>
  );
};

export default CustomCheckbox;
