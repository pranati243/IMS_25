import { formatDate } from "@/app/lib/utils";

type Announcement = {
  id: number;
  title: string;
  content: string;
  date: Date;
  author: string;
};

type AnnouncementCardProps = {
  announcements: Announcement[];
  maxItems?: number;
};

export default function AnnouncementCard({
  announcements,
  maxItems = 5,
}: AnnouncementCardProps) {
  const displayedAnnouncements = announcements.slice(0, maxItems);

  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <h3 className="text-lg font-medium leading-6 text-white">
          Announcements
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {displayedAnnouncements.length > 0 ? (
          displayedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-md font-medium text-gray-900">
                  {announcement.title}
                </h4>
                <span className="text-xs text-gray-500">
                  {formatDate(announcement.date)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {announcement.content}
              </p>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>By: {announcement.author}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No announcements available
          </div>
        )}
      </div>
      {announcements.length > maxItems && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 text-center">
          <button
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => console.log("View all announcements")}
          >
            View all announcements
          </button>
        </div>
      )}
    </div>
  );
}
