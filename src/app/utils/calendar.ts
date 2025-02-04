type EventData = {
  title: string;
  startTime: string;
  endTime: string;
  dates: Date[];
  calendarId: string;
  timeZone: string;
  colorId: string;
};

export async function createEvents(eventData: EventData) {
  try {
    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to create events');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating events:', error);
    throw error;
  }
}
