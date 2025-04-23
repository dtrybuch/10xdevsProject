import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormInput from "../ui/form-input";
import { LogIn } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Handle login logic here (will be implemented later)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Email"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      
      <FormInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-end">
        <Button variant="link" className="px-0" asChild>
          <a href="/forgot-password">
            Forgot password?
          </a>
        </Button>
      </div>

      <Button type="submit" className="w-full" size="lg">
        <LogIn className="mr-2 h-4 w-4" />
        Sign in
      </Button>

      <div className="text-center">
        <Button variant="link" asChild>
          <a href="/register">
            Don't have an account? Sign up
          </a>
        </Button>
      </div>
    </form>
  );
}