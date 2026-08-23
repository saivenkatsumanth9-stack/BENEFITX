import type { AppNotification } from "@/lib/types";

/** MOCK notifications — replace with a backend notification feed later. */
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-1",
    title: "New relevant scheme detected",
    body: "Student Laptop & Digital Access Support matches your education and state profile.",
    type: "opportunity",
    createdAt: "2026-08-22T04:10:00Z",
    read: false,
  },
  {
    id: "ntf-2",
    title: "Income Certificate is still missing",
    body: "Four of your recommended schemes ask for an Income Certificate.",
    type: "document",
    createdAt: "2026-08-21T11:32:00Z",
    read: false,
  },
  {
    id: "ntf-3",
    title: "Application readiness updated",
    body: "Adding your Bank Passbook improved your overall readiness score.",
    type: "readiness",
    createdAt: "2026-08-20T08:15:00Z",
    read: true,
  },
  {
    id: "ntf-4",
    title: "Scheme information was updated",
    body: "Youth Internship & Stipend Programme published a revised notification date.",
    type: "update",
    createdAt: "2026-08-18T16:45:00Z",
    read: true,
  },
];
