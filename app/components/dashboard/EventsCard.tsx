import { formatDate } from "@/app/lib/utils";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";

type Event = {
  id: number;
  title: string;
  date: Date;
  location: string;
};

type EventsCardProps = {
  events: Event[];
  maxItems?: number;
};

export default function EventsCard({ events, maxItems = 5 }: EventsCardProps) {
  const displayedEvents = events.slice(0, maxItems);

  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <h3 className="text-lg font-medium leading-6 text-white">
          Upcoming Events
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-md font-medium text-gray-900">
                  {event.title}
                </h4>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{event.location}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No upcoming events
          </div>
        )}
      </div>
      {events.length > maxItems && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 text-center">
          <button
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => console.log("View all events")}
          >
            View all events
          </button>
        </div>
      )}
    </div>
  );
}
