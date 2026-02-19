import { useNavigate } from "@tanstack/react-router";
import { Clock, Settings } from "lucide-react";
import { useUIStore } from "../../stores/ui-store";
import { IconButton } from "../../components/icon-button";

export const HomeHeader = () => {
  const navigate = useNavigate();
  const { setShowSettings } = useUIStore.actions();

  return (
    <header className="flex justify-between items-center py-2 pb-4 min-h-11">
      <h1 className="text-lg font-extrabold font-mono text-th-a tracking-wide">unrack</h1>
      <nav className="flex gap-1">
        <IconButton onClick={() => navigate({ to: "/history" })}>
          <Clock size={18} />
        </IconButton>
        <IconButton onClick={() => setShowSettings(true)}>
          <Settings size={18} />
        </IconButton>
      </nav>
    </header>
  );
};
