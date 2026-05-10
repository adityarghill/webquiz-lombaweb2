import { Input, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/authContext";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const { data, error } = await resetPassword(email);
    
    if (error) {
      setErrorMsg(error);
      setLoading(false);
    } else {
      setSuccessMsg("Password reset email sent! Check your email for instructions.");
      setTimeout(() => {
        navigate("/auth/sign-in");
      }, 3000);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4" style={{ background: "#ece161" }}>
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_7px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="text-center mb-8">
            <Typography variant="h3" className="text-black font-bold mb-2">
              Reset Password
            </Typography>
            <Typography variant="paragraph" className="text-gray-600 text-sm">
              Enter your email and we'll send you a link to reset your password
            </Typography>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleResetPassword}>
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

            {/* Send Reset Email Button */}
            <Button
              type="submit"
              className={`w-full h-12 mt-6 rounded-md border-2 border-black p-2.5 font-semibold transition-all !shadow-none hover:!shadow-[2px_2px_0px_#000] ${
                email && !loading
                  ? "bg-white text-black"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              size="lg"
              disabled={!email || loading}
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Typography variant="small" className="text-gray-600">
              Remember your password?{" "}
              <Link
                to="/auth/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Sign in
              </Link>
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
