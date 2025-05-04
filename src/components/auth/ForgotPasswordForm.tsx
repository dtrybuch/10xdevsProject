import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormInput from "../ui/form-input";
import { Mail, RotateCcw } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      console.log(email);
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">Check your email</h3>
        <p className="text-sm text-muted-foreground">We have sent a password reset link to {email}</p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)} className="mt-4">
          <RotateCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Email"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        autoComplete="email"
        disabled={isLoading}
      />

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Sending reset link...
          </div>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send reset link
          </>
        )}
      </Button>

      <div className="text-center">
        <Button variant="link" asChild>
          <a href="/login">Remember your password? Sign in</a>
        </Button>
      </div>
    </form>
  );
}
