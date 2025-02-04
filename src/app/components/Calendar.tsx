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
      const dayOfWeek = new Date(date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(date)}
          className={`
            p-2 w-full aspect-square flex items-center justify-center rounded-lg text-lg font-medium
            transition-all duration-200 transform hover:scale-105
            ${isSelected 
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg' 
              : isWeekend
                ? 'hover:bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }
            ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''}
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
    <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div 
            key={day} 
            className={`p-2 text-center font-bold text-sm ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
}
