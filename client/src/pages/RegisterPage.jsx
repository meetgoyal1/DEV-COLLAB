import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import GoogleButton from "../components/GoogleButton";
import DevCollabLogo from "../components/DevCollabLogo";

const RegisterPage = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      await googleLogin(credentialResponse);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="shrink-0 px-6 py-4">
        <DevCollabLogo />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-10">
      <div className="bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl w-full max-w-md border border-teal-900/40 shadow-lg shadow-teal-950/20">
        <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
        <p className="text-slate-400 text-sm mb-6">Join DevCollab today</p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/35 text-rose-300 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google signup failed")}
        />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-500 text-xs">or register with email</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white py-2.5 rounded-lg font-medium transition shadow-md shadow-teal-900/30 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-slate-500 text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
      </main>
    </div>
  );
};

export default RegisterPage;