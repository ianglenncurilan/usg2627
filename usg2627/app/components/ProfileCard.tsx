import Link from "next/link";

interface ProfileCardProps {
  name: string;
  role: string;
  trunkLine?: string;
  directLine?: string;
  roomAddress?: string;
  authoredBills?: number;
  coAuthoredBills?: number;
  authoredResolutions?: number;
  coAuthoredResolutions?: number;
  billsPassedIntoLaw?: number;
  avatarSrc?: string;
}

export default function ProfileCard({
  name,
  role,
  trunkLine,
  directLine,
  roomAddress,
  authoredBills = 0,
  coAuthoredBills = 0,
  authoredResolutions = 0,
  coAuthoredResolutions = 0,
  billsPassedIntoLaw = 0,
  avatarSrc,
}: ProfileCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[0.98] hover:shadow-md">
      <div className="flex gap-4">
        {/* Avatar Container */}
        <div className="flex-shrink-0">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#173490] to-[#1e4bb8]">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
          </div>
        </div>

        {/* Member Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{name}</h3>
          <span className="inline-block mt-2 rounded-full bg-[#173490]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
            {role}
          </span>
        </div>
      </div>

      {/* Contact & Office Info */}
      <div className="mt-6 space-y-3">
        {trunkLine && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#173490]"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Trunk Line: {trunkLine}</span>
          </div>
        )}
        {directLine && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#173490]"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.96a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Direct Line: {directLine}</span>
          </div>
        )}
        {roomAddress && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#173490]"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{roomAddress}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Authored Bills
          </p>
          <p className="mt-1 text-xl font-bold text-[#173490]">{authoredBills}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Co-Authored Bills
          </p>
          <p className="mt-1 text-xl font-bold text-[#173490]">{coAuthoredBills}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Authored Resolutions
          </p>
          <p className="mt-1 text-xl font-bold text-[#173490]">{authoredResolutions}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bills Passed into Law
          </p>
          <p className="mt-1 text-xl font-bold text-[#173490]">{billsPassedIntoLaw}</p>
        </div>
      </div>

      {/* Social Icon & CTA */}
      <div className="mt-6 flex items-center justify-between">
        <a
          href="#"
          className="rounded-full bg-[#1877F2] p-2 text-white transition hover:bg-[#166fe5]"
          aria-label="Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <Link
          href="#"
          className="text-sm font-semibold text-[#173490] transition hover:text-[#E7C609]"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}
