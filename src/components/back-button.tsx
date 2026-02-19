import { useNavigate } from "@tanstack/react-router";
import { Button } from "@base-ui/react/button";
import { ChevronLeft } from "lucide-react";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate({ to: "/" })}
      className="w-11 h-11 flex items-center justify-center bg-th-s1 border border-th-b rounded-xl text-th-t3 cursor-pointer"
    >
      <ChevronLeft size={18} />
    </Button>
  );
};
