import React, { useState } from 'react';

type CalendarProps = {
  selectedDates: Date[];
  onDateSelect: (dates: Date[]) => void;
};

export default function Calendar({ selectedDates, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      (selectedDate) =>
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
    );
  };

  const handleDateClick = (date: Date) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      date.getDate(),
      0, 0, 0
    );
    // タイムゾーンを考慮した日付に調整
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());

    if (isDateSelected(newDate)) {
      onDateSelect(
        selectedDates.filter(
          (selectedDate) =>
            selectedDate.getDate() !== newDate.getDate() ||
            selectedDate.getMonth() !== newDate.getMonth() ||
            selectedDate.getFullYear() !== newDate.getFullYear()
        )
      );
    } else {
      onDateSelect([...selectedDates, newDate]);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // 前月の日付を埋める
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // 当月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isSelected = isDateSelected(date);

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(date)}
          className={`p-2 w-full aspect-square flex items-center justify-center rounded-full transition-colors
            ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-gray-100'}
            ${date.getTime() < new Date().setHours(0, 0, 0, 0) ? 'text-gray-400' : ''}
          `}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="p-2 text-center font-medium">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
}
