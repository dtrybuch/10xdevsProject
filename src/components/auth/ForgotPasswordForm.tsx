import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormInput from "../ui/form-input";
import { Mail, RotateCcw } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Handle password recovery logic here (will be implemented later)
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We have sent a password reset link to {email}
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSubmitted(false)}
          className="mt-4"
        >
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
      />

      <Button type="submit" className="w-full" size="lg">
        <Mail className="mr-2 h-4 w-4" />
        Send reset link
      </Button>

      <div className="text-center">
        <Button variant="link" asChild>
          <a href="/login">
            Remember your password? Sign in
          </a>
        </Button>
      </div>
    </form>
  );
} 