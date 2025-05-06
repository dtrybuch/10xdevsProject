import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useNavigate } from "../hooks/useNavigate";

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto text-center">
      <CardHeader>
        <CardTitle>Brak fiszek</CardTitle>
        <CardDescription>
          Nie masz jeszcze żadnych fiszek do nauki
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-6">
          <svg
            className="w-24 h-24 mx-auto text-muted-foreground"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => navigate("/generate")}>
          Utwórz nowe fiszki
        </Button>
      </CardFooter>
    </Card>
  );
} 