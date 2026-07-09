// frontend/src/staff/components/ClockTimePicker.jsx
import { useState } from "react";
import Clock from "react-clock";
import "react-clock/dist/Clock.css";
const ClockTimePicker = ({ value, onChange }) => {
  const [date, setDate] = useState(value);

  const updateTime = (newDate) => {
    setDate(newDate);
    onChange(newDate);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-3">
      <Clock
        value={date}
        onChange={updateTime}
        size={160}
        renderNumbers
        hourHandWidth={4}
        minuteHandWidth={2}
        secondHandWidth={0}
      />

      {/* Time text */}
      <div className="text-sm font-medium">
        {date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

export default ClockTimePicker;
