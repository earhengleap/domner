//components/Guide/Navbar.tsx
"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import AuthenticatedAvatar from "../AuthenticatedAvatar";
import { Button } from "../ui/button";
import Link from "next/link";
import axios from 'axios';
import { Bell } from 'lucide-react';
import Logo from '@/public/DomnerDesktop.png'
import GuideProfileAvatar from "../GuideProfileAvatar";

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  bookingDetails?: string;
}

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');

  const toggleModal = () => setShowModal((prev) => !prev);
  const toggleNotifications = () => setShowNotifications((prev) => !prev);

  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (status === 'authenticated') {
      fetchNotifications();
      // Set up polling to check for new notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000);
      return () => clearInterval(intervalId);
    }
  }, [status]);

  const markAsRead = async (id: string) => {
    try {
      await axios.put('/api/notifications', { id });
      setNotifications(notifications.map(n => n.id === id ? {...n, isRead: true} : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderNotification = (notification: Notification) => {
    if (notification.type === 'booking') {
      const bookingDetails = notification.bookingDetails ? JSON.parse(notification.bookingDetails) : null;
      return (
        <div>
          <p className="text-sm font-semibold">New Booking Alert!</p>
          <p className="text-sm">{bookingDetails?.name} has made a booking.</p>
          {/* Add more booking details here if needed */}
        </div>
      );
    }
    // Handle other notification types here
    return <p className="text-sm">{notification.message}</p>;
  };

  const isLoggedIn = status === "authenticated";
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div>
      <nav
        className={`fixed w-full mx-auto top-0 text-xl left-[50%] translate-x-[-50%] z-20 transition duration-300 ${
          scrolled
            ? "bg-white text-gray-900 shadow-md"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="/guide-dashboard"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src={Logo.src}
              width={32}
              height={32}
              className="h-8 w-auto"
              alt="DomnerLogo"
            />
          </a>

          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse z-10 gap-2 items-center">
            {isLoggedIn && (
              <div className="relative">
                <button onClick={toggleNotifications} className="p-1 rounded-full hover:bg-gray-200">
                  <Bell />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="flex border-b">
                      <button
                        className={`flex-1 p-2 ${activeTab === 'unread' ? 'bg-gray-100' : ''}`}
                        onClick={() => setActiveTab('unread')}
                      >
                        Unread
                      </button>
                      <button
                        className={`flex-1 p-2 ${activeTab === 'all' ? 'bg-gray-100' : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        All
                      </button>
                    </div>
                    <div className="py-2 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-500">No notifications</p>
                      ) : (
                        notifications
                          .filter(n => activeTab === 'all' || !n.isRead)
                          .map((notification) => (
                            <div key={notification.id} className={`px-4 py-2 hover:bg-gray-100 ${notification.isRead ? 'opacity-50' : ''}`}>
                              {renderNotification(notification)}
                              <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                              {!notification.isRead && (
                                <button 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-500 hover:text-blue-700"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isLoggedIn ? (
              <GuideProfileAvatar session={session} />
            ) : (
              <Button
                className={`p-2 px-6 rounded-sm font-semibold cursor-pointer ${
                  scrolled ? "bg-green-500" : "bg-green-500"
                }`}
                asChild
                variant={"outline"}
              >
                <Link href="/login">Log in</Link>
              </Button>
            )}

            <button
              data-collapse-toggle="navbar-cta"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-xl text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-cta"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className="items-right justify-between hidden w-full md:flex md:w-auto md:order-1 right"
            id="navbar-cta"
          >
            <ul
              className={`flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 text-gray-900`}
            >
              <li>
                <a
                  href="/guide-dashboard"
                  className={`block py-2 px-3 md:p-0 rounded hover:text-green-500 text-lg`}
                  aria-current="page"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/guide-dashboard/create-post"
                  className={`block py-2 px-3 md:p-0 rounded hover:bg-gray-100 md:hover:bg-transparent hover:text-green-500 text-lg`}
                >
                  Create
                </a>
              </li>
              <li>
                <a
                  href="/guide-dashboard/manage"
                  className={`block py-2 px-3 md:p-0 rounded hover:bg-gray-100 md:hover:bg-transparent hover:text-green-500 text-lg`}
                >
                  Manage
                </a>
              </li>
              <li>
                <a
                  href="/guide-dashboard/help"
                  className={`block py-2 px-3 md:p-0 rounded hover:bg-gray-100 md:hover:bg-transparent hover:text-green-500 text-lg`}
                >
                  Help
                </a>
              </li>
              {session?.user?.role === 'GUIDE' && (
                <Link href="/guide-dashboard/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Guide Profile
                </Link>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}