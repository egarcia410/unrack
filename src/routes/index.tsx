import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold">Unrack</h1>
    </div>
  );
}
