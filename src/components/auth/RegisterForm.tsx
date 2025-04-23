import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormInput from "../ui/form-input";
import { UserPlus } from "lucide-react";
import { useNavigate } from "@/components/hooks/useNavigate";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Form validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          submit: data.error || 'Registration failed. Please try again.',
        });
        return;
      }

      // Registration successful - user is automatically logged in
      // Redirect to generate
      navigate('/generate');
    } catch (error) {
      setErrors({
        submit: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {errors.submit}
        </div>
      )}

      <FormInput
        label="Email"
        type="email"
        name="email"
        placeholder="name@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        disabled={isLoading}
      />
      
      <FormInput
        label="Password"
        type="password"
        name="password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <FormInput
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        <UserPlus className="mr-2 h-4 w-4" />
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="text-center">
        <Button variant="link" asChild disabled={isLoading}>
          <a href="/login">
            Already have an account? Sign in
          </a>
        </Button>
      </div>
    </form>
  );
} 