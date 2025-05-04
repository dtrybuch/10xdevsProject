import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  "data-test-id"?: string;
}

export function SkeletonLoader({ "data-test-id": testId }: SkeletonLoaderProps) {
  // Show 3 skeleton cards to represent loading state
  return (
    <div className="space-y-4" data-test-id={testId}>
      {[1, 2, 3].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
