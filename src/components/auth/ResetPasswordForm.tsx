import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FormInput from "../ui/form-input";
import { Key } from "lucide-react";
import { useNavigate } from "@/components/hooks/useNavigate";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Get URL parameters for password reset
  const getResetParams = () => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return {
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
      expires_in: params.get("expires_in"),
      token_type: params.get("token_type"),
      type: params.get("type"),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    const resetParams = getResetParams();
    if (!resetParams?.access_token) {
      setError("Invalid or expired reset link");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetParams.access_token}`,
        },
        body: JSON.stringify({
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      // Redirect to login page on success with a success message
      navigate("/login?message=password-reset-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Check for reset parameters on mount
  useEffect(() => {
    const resetParams = getResetParams();
    if (!resetParams?.access_token) {
      setError("Invalid or expired reset link");
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <FormInput
        label="Confirm Password"
        type="password"
        placeholder="Confirm your new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={error}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Button type="submit" className="w-full" size="lg" disabled={isLoading || !getResetParams()?.access_token}>
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Resetting password...
          </div>
        ) : (
          <>
            <Key className="mr-2 h-4 w-4" />
            Reset Password
          </>
        )}
      </Button>

      <div className="text-center">
        <Button variant="link" asChild>
          <a href="/login">Back to login</a>
        </Button>
      </div>
    </form>
  );
}
