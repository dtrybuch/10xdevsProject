import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormInput from "../ui/form-input";
import { LogIn } from "lucide-react";
import { useNavigate } from "@/components/hooks/useNavigate";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        console.log("Attempting to fetch /api/auth/login with:", { email });

        // Zabezpieczenie przed errorem fetch
        let response;
        try {
          response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
          console.log("Login response status:", response.status);
        } catch (fetchError: any) {
          console.error("Fetch error during login:", fetchError);
          throw new Error(`Network error: ${fetchError.message || "Unknown fetch error"}`);
        }

        let data;
        try {
          data = await response.json();
          console.log("Login response data:", data);
        } catch (jsonError: any) {
          console.error("JSON parsing error:", jsonError);
          throw new Error(`Error parsing response: ${jsonError.message || "Unknown JSON parsing error"}`);
        }

        if (!response.ok) {
          console.error("Login failed with error:", data.error);
          setErrors({ form: data.error || "Login error occurred" });
          return;
        }

        console.log("Login successful, navigating to /generate");
        // Redirect to generate page on success
        navigate("/generate");
      } catch (error: any) {
        console.error("Login error details:", error);
        setErrors({ form: `An unexpected error occurred: ${error.message || "Unknown error"}` });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-test-id="login-form">
      <FormInput
        label="Email"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        disabled={isLoading}
        data-test-id="email-input"
      />

      <FormInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
        disabled={isLoading}
        data-test-id="password-input"
      />

      {errors.form && (
        <div className="text-sm text-red-500 mt-2" data-test-id="login-error">
          {errors.form}
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button variant="link" className="px-0" asChild>
          <a href="/forgot-password">Forgot password?</a>
        </Button>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-test-id="login-button">
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Signing in...
          </div>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </>
        )}
      </Button>

      <div className="text-center">
        <Button variant="link" asChild>
          <a href="/register">Don&apos;t have an account? Sign up</a>
        </Button>
      </div>
    </form>
  );
}
