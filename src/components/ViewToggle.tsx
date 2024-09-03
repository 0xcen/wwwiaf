import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cva } from "class-variance-authority";
import { Button } from "@/components/ui/button";

const toggleWrapper = cva("flex items-center space-x-2", {
  variants: {
    position: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
  },
  defaultVariants: {
    position: "center",
  },
});

interface ViewToggleProps {
  isDebateView: boolean;
  onToggle: () => void;
  position?: "left" | "center" | "right";
}

export function ViewToggle({
  isDebateView,
  onToggle,
  position,
}: ViewToggleProps) {
  return (
    <div className={toggleWrapper({ position })}>
      <Button variant={"secondary"} onClick={onToggle}>
        {!isDebateView ? "Breakpoint Edition" : "Fight Edition"}
      </Button>
    </div>
  );
}
