import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Default styles for react-calendar
import "../App.css"; // Additional Tailwind CSS overrides for react-calendar
import SharedNavbar from './SharedNavbar';

// Calendar content component without navbar - for embedding in dashboards
export const CalendarContent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState("");

  const addEvent = () => {
    if (event.trim() === "") {
      alert("Event cannot be empty.");
      return;
    }
    setEvents([...events, { date: selectedDate.toDateString(), event }]);
    setEvent("");
  };

  const deleteEvent = (eventIndex) => {
    setEvents(events.filter((_, index) => index !== eventIndex));
  };

  const eventsForSelectedDate = events.filter(
    (e) => e.date === selectedDate.toDateString()
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Calendar Section */}
      <div className="flex-grow bg-white rounded-lg shadow-xl p-4">
        <h1 className="text-2xl font-bold text-purple-500 text-center mb-4">
          Event Calendar
        </h1>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          className="mx-auto"
        />
      </div>

      {/* Event Management Section */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-purple-500 mb-4">
          Manage Events
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Event Name"
            className="w-full border-purple-500 border rounded p-2 focus:ring-purple-500 focus:outline-none"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
          />
        </div>
        <button
          onClick={addEvent}
          className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Add Event
        </button>

        <h3 className="text-lg font-bold text-purple-500 mt-6 mb-2">
          Events on {selectedDate.toDateString()}:
        </h3>
        <div className="space-y-2">
          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((ev, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{ev.event}</span>
                <button
                  onClick={() => deleteEvent(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events for this date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Full calendar page component with navbar - for standalone route
const EventCalendar = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <SharedNavbar />
      <div className="p-6">
        <CalendarContent />
      </div>
    </div>
  );
};

export default EventCalendar;
