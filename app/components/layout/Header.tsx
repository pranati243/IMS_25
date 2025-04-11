"use client";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/app/lib/utils";

// Mock notifications
const notifications = [
  {
    id: 1,
    content: "New faculty member joined",
    time: "5 mins ago",
    read: false,
  },
  {
    id: 2,
    content: "NBA Committee meeting scheduled",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    content: "Reports are due tomorrow",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    content: "System maintenance tonight",
    time: "Yesterday",
    read: true,
  },
];

export default function Header(user: {
  name: string;
  role: string;
  email: string;
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white shadow-sm px-4 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
        {/* Search input could go here if needed */}

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {unreadCount} unread notifications
                    </p>
                  )}
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={classNames(
                        "px-4 py-2 hover:bg-gray-50 cursor-pointer",
                        notification.read ? "opacity-75" : "bg-indigo-50"
                      )}
                    >
                      <p className="text-sm text-gray-900">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="py-1">
                  <button className="block w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-50">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-x-4 text-sm font-medium text-gray-900 focus:outline-none">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                {user.name.charAt(0)}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={classNames(
                        active ? "bg-gray-50" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      <div className="flex items-center">
                        <UserCircleIcon
                          className="mr-3 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        Your Profile
                      </div>
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={classNames(
                        active ? "bg-gray-50" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      <div className="flex items-center">
                        <Cog6ToothIcon
                          className="mr-3 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        Settings
                      </div>
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/logout"
                      className={classNames(
                        active ? "bg-gray-50" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      <div className="flex items-center">
                        <ArrowLeftOnRectangleIcon
                          className="mr-3 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        Sign out
                      </div>
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
