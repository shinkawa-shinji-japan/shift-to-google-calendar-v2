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
  { id: "9", name: "ブルーベリー", color: "#3F51B5" },
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

  const { register, handleSubmit, watch, setValue } =
    useForm<TimeSelectFormData>({
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
        const response = await fetch("/api/calendar/list");
        if (!response.ok) throw new Error("Failed to fetch calendars");
        const data = await response.json();
        setCalendars(data);
        // カレンダーリストが取得できたら、最初のカレンダーをデフォルト値として設定
        if (data.length > 0) {
          setValue("calendarId", data[0].id);
        }
      } catch (error) {
        console.error("Error fetching calendars:", error);
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200"
    >
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
          className="mt-1 block w-full h-16 rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg transition-colors"
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
            className="mt-1 block w-full h-16 rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg transition-colors pl-9"
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
              backgroundColor:
                EVENT_COLORS.find((color) => color.id === watch("colorId"))
                  ?.color || EVENT_COLORS[0].color,
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
        <textarea
          id="title"
          {...register("title")}
          className="mt-1 block w-full h-16 rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg transition-colors p-3"
          placeholder="シフトの予定タイトルを入力してください"
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
            className="mt-1 block w-full h-16 rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg transition-colors"
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
            className="mt-1 block w-full h-16 rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg transition-colors"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

    </form>
  );
}
