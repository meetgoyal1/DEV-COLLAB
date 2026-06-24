import { useState } from "react";

/**
 * Member avatar with hover popover (appears BELOW avatar)
 */
const MemberAvatarPopover = ({ member }) => {
  const [open, setOpen] = useState(false);

  const username = member.username || "Unknown";
  const displayName =
    username.length > 0
      ? username[0].toUpperCase() + username.slice(1)
      : username;
  const email = member.email || "";

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Avatar Button */}
      <button
        type="button"
        className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 border-2 border-slate-900 flex items-center justify-center text-sm overflow-hidden text-white"
      >
        {member.avatar ? (
          <img
            src={member.avatar}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          username[0]?.toUpperCase()
        )}
      </button>

      {/* Popover BELOW */}
      {open && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-[calc(100%+10px)] w-64 rounded-xl border border-slate-700 bg-slate-900 shadow-lg p-3">
          
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 h-3 w-3 rotate-45 bg-slate-900 border-t border-l border-slate-700" />

          <div className="flex items-center gap-3">
            
            {/* Large Avatar */}
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 overflow-hidden flex items-center justify-center text-lg font-semibold text-white">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                username[0]?.toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-teal-300 truncate">
                @{username}
              </p>
              {email && (
                <p className="text-xs text-slate-400 truncate">
                  {email}
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAvatarPopover;