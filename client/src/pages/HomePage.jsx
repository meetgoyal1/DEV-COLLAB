import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import DevCollabLogo from "../components/DevCollabLogo";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) navigate("/dashboard");
    else navigate("/register");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <DevCollabLogo />
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-slate-600 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-medium text-white">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-white text-sm font-medium">
                  {user.username}
                </span>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition shadow-md shadow-teal-900/30"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-slate-400 hover:text-teal-200 text-sm px-4 py-2 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition shadow-md shadow-teal-900/30"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-32">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-600 opacity-15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-emerald-600 opacity-12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-cyan-600 opacity-12 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block bg-teal-500/10 border border-teal-500/35 text-teal-300 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            Real-time collaboration for developers
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Code Together,{" "}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Ship Faster
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            DevCollab brings your team into one space — real-time code editing,
            instant chat, and live code execution. No setup, just collaborate.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium px-8 py-3 rounded-lg transition text-base shadow-lg shadow-teal-900/25"
            >
              Start Collaborating →
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="text-slate-400 hover:text-teal-200 border border-slate-700 hover:border-teal-600/50 px-8 py-3 rounded-lg transition text-base"
            >
              See how it works
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10 mt-16 flex-wrap">
            {[
              { value: "Real-time", label: "Code sync" },
              { value: "Multi-lang", label: "Code execution" },
              { value: "Instant", label: "Team chat" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              collaborate
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Built for developers who want to move fast without switching between
            ten different tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              title: "Live Code Editor",
              desc: "Monaco-powered editor with real-time sync. Multiple cursors, syntax highlighting, and zero lag.",
              color: "teal",
            },
            {
              icon: "💬",
              title: "Instant Chat",
              desc: "Room-based messaging so your team can discuss code without leaving the editor.",
              color: "emerald",
            },
            {
              icon: "▶",
              title: "Run Code Instantly",
              desc: "Execute JavaScript and Python snippets directly in the browser. See output immediately.",
              color: "cyan",
            },
            {
              icon: "🚪",
              title: "Collaboration Rooms",
              desc: "Create private rooms and invite teammates with a simple code. No account needed to join.",
              color: "teal",
            },
            {
              icon: "🟢",
              title: "Presence Indicators",
              desc: "See who's online in real-time. Know exactly who's in the room and what they're editing.",
              color: "emerald",
            },
            {
              icon: "📁",
              title: "File Sharing",
              desc: "Share files and images directly in chat. Preview images inline without leaving the room.",
              color: "cyan",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 hover:border-teal-500/40 transition group"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-4
                ${feature.color === "teal" ? "bg-teal-500/10" : ""}
                ${feature.color === "emerald" ? "bg-emerald-500/10" : ""}
                ${feature.color === "cyan" ? "bg-cyan-500/10" : ""}
              `}
              >
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-24 relative">
        <div className="absolute inset-0 bg-teal-600/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Up and running in{" "}
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                seconds
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              No complex setup. Just create a room and start coding together.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-teal-600 via-emerald-600 to-transparent" />

            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "Create your account",
                  desc: "Sign up with email or continue with Google. Takes less than 30 seconds.",
                  align: "right",
                },
                {
                  step: "02",
                  title: "Create or join a room",
                  desc: "Create a new collaboration room or join an existing one using an invite code.",
                  align: "left",
                },
                {
                  step: "03",
                  title: "Start coding together",
                  desc: "Open the editor, start typing, and watch your teammates' changes appear in real-time.",
                  align: "right",
                },
                {
                  step: "04",
                  title: "Run and share results",
                  desc: "Execute your code and share the output with your team directly in the room.",
                  align: "left",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`flex items-center gap-8 ${
                    item.align === "left"
                      ? "md:flex-row-reverse"
                      : "md:flex-row"
                  } flex-row`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${item.align === "left" ? "md:text-right" : ""} pl-16 md:pl-0`}
                  >
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 hover:border-teal-500/35 transition">
                      <span className="text-teal-400 text-xs font-mono font-bold">
                        STEP {item.step}
                      </span>
                      <h3 className="text-white font-semibold text-lg mt-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Circle on line */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-teal-600 border-2 border-emerald-400 z-10" />

                  {/* Empty side */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <div className="relative bg-slate-900/90 border border-teal-500/25 rounded-2xl p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600/15 via-emerald-600/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build together?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join developers already using DevCollab to write better code,
              faster.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium px-10 py-3.5 rounded-lg transition text-base shadow-lg shadow-teal-900/30"
            >
              {user ? "Go to Dashboard →" : "Get Started Free →"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs font-bold">
              D
            </div>
            <span className="text-slate-400 text-sm">DevCollab</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-500 hover:text-teal-400 text-sm transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-slate-500 hover:text-teal-400 text-sm transition"
            >
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
