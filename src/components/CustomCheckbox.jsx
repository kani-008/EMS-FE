// frontend/src/components/CustomCheckbox.jsx
import assets from "../assets/assets";

const SIZE_MAP = {
  sm: {
    box: "w-5 h-5",
    tick: "w-10 h-8 mt-1",
  },
  md: {
    box: "w-5 h-6",
    tick: "w-12 h-10 mt-1",
  },
};

const CustomCheckbox = ({ checked, onChange, size = "md", variant = "default" }) => {
  const isStudent = variant === "student";
  const { box, tick } = SIZE_MAP[size];
  const boxClass = isStudent ? "w-5 h-5" : box;

  return (
    <label className={`cursor-pointer select-none ${isStudent ? "flex items-center justify-center" : "inline-flex items-center"}`}>
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
          ${boxClass}
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
            className={`${tick} shrink-0`}
          />
        )}
      </span>
    </label>
  );
};

export default CustomCheckbox;
