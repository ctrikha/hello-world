import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMeetings } from "@/actions/schedule";
import { format, isAfter } from "date-fns";

function MeetingCard({
  meeting,
  currentUserId,
}: {
  meeting: Awaited<ReturnType<typeof getMeetings>>[number];
  currentUserId: string;
}) {
  const isAdvisor = meeting.advisorId === currentUserId;
  const other = isAdvisor ? meeting.student : meeting.advisor;
  const isPast = !isAfter(meeting.startTime, new Date());

  return (
    <div
      className={`bg-white border rounded-xl p-4 ${isPast ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{meeting.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            with {other.name ?? other.email}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            meeting.status === "CONFIRMED"
              ? "bg-green-100 text-green-700"
              : meeting.status === "CANCELLED"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {meeting.status.toLowerCase()}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {format(meeting.startTime, "EEEE, MMMM d")} ·{" "}
        {format(meeting.startTime, "h:mm a")} –{" "}
        {format(meeting.endTime, "h:mm a")}
      </p>
      {meeting.meetingUrl && (
        <a
          href={meeting.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
        >
          Join meeting ↗
        </a>
      )}
    </div>
  );
}

export default async function SchedulePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const meetings = await getMeetings();
  const upcoming = meetings.filter((m) =>
    isAfter(m.startTime, new Date())
  );
  const past = meetings.filter((m) => !isAfter(m.startTime, new Date()));

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Schedule</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
            No upcoming meetings.
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((m) => (
              <MeetingCard
                key={m.id}
                meeting={m}
                currentUserId={session.user.id}
              />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Past ({past.length})
          </h2>
          <div className="space-y-3">
            {past.slice(0, 5).map((m) => (
              <MeetingCard
                key={m.id}
                meeting={m}
                currentUserId={session.user.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
