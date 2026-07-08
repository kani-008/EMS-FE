// frontend/src/student/components/RequestCategoryBadge.jsx

const categoryStyles = {
  Leave: "border-red-500 text-red-600",
  "Paper Presentation": "border-purple-500 text-purple-600",
  Sports: "border-orange-400 text-orange-500",
  "Non-Technical Event": "border-blue-400 text-blue-500",
};

const RequestCategoryBadge = ({ category }) => {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        h-7
        w-[145px]        /* 🔥 SAME WIDTH FOR ALL */
        rounded-2xl
        text-center
        font-bold
        border 
        ${categoryStyles[category] || "border-gray-300 text-gray-500"}
      `}
    >
      {category}
    </span>
  );
};

export default RequestCategoryBadge;
