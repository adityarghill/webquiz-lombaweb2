import { Input, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/authContext";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);
  const { signIn, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const { data, error } = await signIn(email, password);
    
    if (error) {
      setErrorMsg(error);
      setLoading(false);
    } else {
      setSuccessMsg("Sign in successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard/quiz");
      }, 1500);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }

    setResendingEmail(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { data, error } = await resendVerificationEmail(email);

    if (error) {
      setErrorMsg(error);
    } else {
      setSuccessMsg("Verification email sent! Check your inbox.");
    }
    setResendingEmail(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4" style={{ background: "#ece161" }}>
      {/* Main Container */}
      <div className="w-full max-w-md ">
        {/* Card Container */}
        <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_7px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="text-center mb-8">
            <Typography variant="h3" className="text-black font-bold mb-2">
              Welcome Back
            </Typography>
            <Typography variant="paragraph" className="text-gray-600 text-sm">
              Please sign in to your account
            </Typography>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <div>{errorMsg}</div>
              {errorMsg.includes("verify your email") && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium underline text-left"
                  disabled={resendingEmail}
                >
                  {resendingEmail ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSignIn}>
            {/* Email Field */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!bg-gray-50 !border-gray-300 !text-black placeholder-gray-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!bg-gray-50 !border-gray-300 !text-black placeholder-gray-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className={`w-full h-12 mt-6 rounded-md border-2 border-black p-2.5 font-semibold transition-all !shadow-none hover:!shadow-[2px_2px_0px_#000] ${
                email && password && !loading
                    ? "bg-white text-black"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              size="lg"
              disabled={!email || !password || loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Typography variant="small" className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/auth/sign-up"
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Sign up
              </Link>
            </Typography>
          </div>
        </div>

      </div>
    </section>
  );
}

export default SignIn;
