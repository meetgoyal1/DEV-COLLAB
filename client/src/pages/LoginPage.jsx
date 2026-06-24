import { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import GoogleButton from "../components/GoogleButton";
import DevCollabLogo from "../components/DevCollabLogo";

const LoginPage = () => {
    const { login , googleLogin } = useAuth();
    const navigate = useNavigate();
    const [form , setForm] = useState({email: "" , password : ""});
    const [error, setError] = useState("");
    const [loading , setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name] : e.target.value
        });
    };
    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form.email,form.password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally{
            setLoading(false);
        }
    };
    const handleGoogleSuccess = async(creds) => {
        setError("");
        try {
            await googleLogin(creds);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Google login failed");
        }
    };
    return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="shrink-0 px-6 py-4">
        <DevCollabLogo />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-10">
      <div className="bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl w-full max-w-md border border-teal-900/40 shadow-lg shadow-teal-950/20">
        <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
        <p className="text-slate-400 text-sm mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/35 text-rose-300 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed")}
        />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600 text-xs">or continue with email</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="w-full bg-slate-800/80 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              required
              className="w-full bg-slate-800/80 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white py-2.5 rounded-lg font-medium transition shadow-md shadow-teal-900/30 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-slate-500 text-sm mt-4 text-center">
          No account?{" "}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 hover:underline">
            Register
          </Link>
        </p>
      </div>
      </main>
    </div>
  );
};

export default LoginPage;