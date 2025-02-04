import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";

type Calendar = {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
};

type TimeSelectFormData = {
  startTime: string;
  endTime: string;
  title: string;
  calendarId: string;
  timeZone: string;
  colorId: string;
};

const EVENT_COLORS = [
  { id: "10", name: "バジル", color: "#0B8043" },
  { id: "1", name: "ラベンダー", color: "#7986CB" },
  { id: "2", name: "セージ", color: "#33B679" },
  { id: "3", name: "グレープ", color: "#8E24AA" },
  { id: "4", name: "フラミンゴ", color: "#E67C73" },
  { id: "5", name: "バナナ", color: "#F6BF26" },
  { id: "6", name: "タンジェリン", color: "#F4511E" },
  { id: "7", name: "ピーコック", color: "#039BE5" },
  { id: "8", name: "グラファイト", color: "#616161" },
  { id: "9", name: "ブルーベリー", color: "#3F51B5" }
];

type TimeSelectFormProps = {
  onSubmit: (data: TimeSelectFormData) => void;
  isSubmitting?: boolean;
};

export default function TimeSelectForm({
  onSubmit,
  isSubmitting = false,
}: TimeSelectFormProps) {
  const { data: session } = useSession();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<TimeSelectFormData>({
    defaultValues: {
      startTime: "10:00",
      endTime: "17:00",
      title: "シフト",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorId: "10", // バジル色をデフォルトに設定
      calendarId: "", // 初期値を空文字列に設定
    },
  });

  useEffect(() => {
    const fetchCalendars = async () => {
      if (!session?.accessToken) return;
      
      try {
        setIsLoadingCalendars(true);
        const response = await fetch('/api/calendar/list');
        if (!response.ok) throw new Error('Failed to fetch calendars');
        const data = await response.json();
        setCalendars(data);
        // カレンダーリストが取得できたら、最初のカレンダーをデフォルト値として設定
        if (data.length > 0) {
          setValue("calendarId", data[0].id);
        }
      } catch (error) {
        console.error('Error fetching calendars:', error);
      } finally {
        setIsLoadingCalendars(false);
      }
    };

    fetchCalendars();
  }, [session?.accessToken]);

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="relative">
        <label
          htmlFor="calendarId"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          カレンダーを選択
        </label>
        <select
          id="calendarId"
          {...register("calendarId")}
          className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
          disabled={isLoadingCalendars}
        >
          {isLoadingCalendars ? (
            <option>読み込み中...</option>
          ) : (
            calendars.map((calendar) => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.summary}
                {calendar.primary ? " (メイン)" : ""}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="relative">
        <label
          htmlFor="colorId"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          予定の色
        </label>
        <div className="relative">
          <select
            id="colorId"
            {...register("colorId")}
            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors pl-9"
          >
            {EVENT_COLORS.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
            style={{ 
              backgroundColor: EVENT_COLORS.find(
                color => color.id === watch("colorId")
              )?.color || EVENT_COLORS[0].color 
            }}
          />
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          予定タイトル
        </label>
        <input
          type="text"
          id="title"
          {...register("title")}
          className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
          placeholder="予定のタイトルを入力"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <label
            htmlFor="startTime"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            開始時間
          </label>
          <select
            id="startTime"
            {...register("startTime")}
            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label
            htmlFor="endTime"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            終了時間
          </label>
          <select
            id="endTime"
            {...register("endTime")}
            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isLoadingCalendars || calendars.length === 0}
        className="mt-8 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            登録中...
          </span>
        ) : (
          "Googleカレンダーに登録"
        )}
      </button>
    </form>
  );
}
