import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChangeEvent } from "react";

interface TextInputAreaProps {
  value: string;
  onChange: (text: string) => void;
  errorMessage?: string | null;
}

export function TextInputArea({ value, onChange, errorMessage }: TextInputAreaProps) {
  const characterCount = value.length;
  const isValid = characterCount >= 1000 && characterCount <= 10000;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Text</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder="Enter your text here (minimum 1000 characters, maximum 10000 characters)"
            className={`min-h-[200px] ${errorMessage ? "border-red-500" : ""}`}
          />
          <div className="flex justify-between text-sm">
            <span className={`${isValid ? "text-green-600" : "text-red-600"}`}>{characterCount} characters</span>
            <span className="text-gray-500">
              {characterCount < 1000
                ? `${1000 - characterCount} more characters needed`
                : characterCount > 10000
                  ? `${characterCount - 10000} characters over limit`
                  : "Valid length"}
            </span>
          </div>
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
