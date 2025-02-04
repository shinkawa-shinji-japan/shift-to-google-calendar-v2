'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import TimeSelectForm from './components/TimeSelectForm';
import Calendar from './components/Calendar';
import GoogleAuthButton from './components/GoogleAuthButton';
import { createEvents } from './utils/calendar';

export default function Home() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: {
    startTime: string;
    endTime: string;
    title: string;
    calendarId: string;
    timeZone: string;
    colorId: string;
  }) => {
    console.log('Form submitted:', formData);
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      if (selectedDates.length === 0) {
        throw new Error('日付を選択してください');
      }

      await createEvents({
        ...formData,
        dates: selectedDates,
      });

      setSuccess(true);
      setSelectedDates([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予定の登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SessionProvider>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-8">
          シフトをGoogleカレンダーに登録
        </h1>

        <div className="flex flex-col gap-10">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6 w-full backdrop-blur-sm">
              <TimeSelectForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
              <div className="flex justify-center">
                <GoogleAuthButton />
              </div>
              {error && (
                <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-100 shadow-sm flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 text-green-600 bg-green-50 rounded-lg border border-green-100 shadow-sm flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>予定を登録しました!</p>
                </div>
              )}
            </div>

            <div className="w-full">
              <Calendar
                selectedDates={selectedDates}
                onDateSelect={setSelectedDates}
              />
            </div>
          </div>

          <button
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting || selectedDates.length === 0}
            className="w-full max-w-2xl mx-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold py-5 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {isSubmitting ? "登録中..." : "選択した日付をカレンダーに登録"}
          </button>
        </div>

        {selectedDates.length > 0 && (
          <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              選択された日付:
            </h2>
            <ul className="space-y-2 text-blue-900 divide-y divide-blue-100">
              {selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map((date) => (
                  <li key={date.toISOString()} className="pt-2 first:pt-0">
                    {date.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </SessionProvider>
  );
}
