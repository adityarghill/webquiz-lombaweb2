import { Input, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/authContext";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Password validation requirements
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allRequirementsMet = Object.values(requirements).every(req => req === true);

  const RequirementItem = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm py-1">
      <span className={`w-2 h-2 rounded-full flex items-center justify-center text-xs font-bold ${
        met ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
      }`}>
      </span>
      <span className={met ? "text-green-700" : "text-gray-600"}>
        {text}
      </span>
    </div>
  );

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const { data, error } = await signUp(email, password);
    
    if (error) {
      setErrorMsg(error);
      setLoading(false);
    } else {
      setSuccessMsg("Account created! Check your email for verification link. You will be redirected to sign in...");
      setTimeout(() => {
        navigate("/auth/sign-in");
      }, 4000);
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
              Create your account
            </Typography>
            <Typography variant="paragraph" className="text-gray-600 text-sm">
              Welcome! Please fill in the details to get started.
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
          <form className="space-y-4" onSubmit={handleSignUp}>
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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                className="!bg-gray-50 !border-gray-300 !text-black placeholder-gray-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
              />
              
              {/* Password Requirements */}
              {showPasswordRequirements && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Typography variant="small" className="text-gray-700 font-semibold mb-2">
                    Password requirements:
                  </Typography>
                  <div className="space-y-0">
                    <RequirementItem met={requirements.minLength} text="At least 8 characters" />
                    <RequirementItem met={requirements.hasUpperCase} text="At least one uppercase letter (A-Z)" />
                    <RequirementItem met={requirements.hasLowerCase} text="At least one lowercase letter (a-z)" />
                    <RequirementItem met={requirements.hasNumber} text="At least one number (0-9)" />
                    <RequirementItem met={requirements.hasSpecial} text="At least one special character (!@#$%^&*)" />
                  </div>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <Button
                type="submit"
                className={`w-full h-12 mt-6 rounded-md border-2 border-black p-2.5 font-semibold transition-all
                !shadow-none hover:!shadow-[2px_2px_0px_#000]
                ${
                  allRequirementsMet && email && !loading
                    ? "bg-white text-black"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
                size="lg"
                disabled={!allRequirementsMet || !email || loading}
              >
                {loading ? "Creating account..." : "Continue"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Typography variant="small" className="text-gray-600">
              Already have an account?{" "}
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

export default SignUp;
