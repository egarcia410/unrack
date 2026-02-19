import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { IconButton } from "./icon-button";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <IconButton onClick={() => navigate({ to: "/" })}>
      <ChevronLeft size={18} />
    </IconButton>
  );
};
