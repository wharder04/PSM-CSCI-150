import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  return (
    <div className="min-h-screen w-full p-2 bg-bg-main">
      <div className="mb-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Calendar</h1>
        <p className="text-base text-text-secondary">View your upcoming events and deadlines</p>
      </div>
      <div className="max-w-7xl bg-bg-surface text-text-primary border border-border-default rounded-2xl p-6 shadow-soft">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "80vh" }}
          views={["month"]}
          defaultView="month"
        />
      </div>
    </div>
  );
}
