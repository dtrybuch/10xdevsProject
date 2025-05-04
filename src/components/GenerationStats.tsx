import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GenerationStatsProps {
  acceptedCount: number;
  editedCount: number;
  rejectedCount: number;
  sessionDuration: string;
}

export function GenerationStats({ acceptedCount, editedCount, rejectedCount, sessionDuration }: GenerationStatsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generation Session Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold">{acceptedCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Edited</p>
            <p className="text-2xl font-bold">{editedCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold">{rejectedCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold">{formatDuration(sessionDuration)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDuration(isoDuration: string): string {
  const matches = isoDuration.match(/PT(\d+)H(\d+)M(\d+)S/);
  if (!matches) return "00:00:00";

  const [, hours, minutes, seconds] = matches;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}
