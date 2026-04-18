import { NumberField } from "@base-ui/react/number-field";
import { useUnit } from "../stores/polaris";
import { cn } from "../lib/cn";

type WeightInputProps = {
  inputId: string;
  value: string;
  onChange: (filteredValue: string) => void;
  placeholder?: string;
  align?: "right" | "center";
  required?: boolean;
  min?: number;
  className?: string;
  suffix?: string;
};

export const WeightInput = ({
  inputId,
  value,
  onChange,
  placeholder = "0",
  align = "right",
  required = false,
  min = 1,
  className,
  suffix,
}: WeightInputProps) => {
  const unit = useUnit();
  const alignClass = align === "center" ? "text-center" : "text-right";

  return (
    <div className="flex items-center gap-1">
      <NumberField.Root id={inputId} min={min} allowOutOfRange required={required}>
        <NumberField.Input
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            if (!/^\d*$/.test(event.target.value)) return;
            const filtered = String(parseInt(event.target.value, 10) || "");
            onChange(filtered);
          }}
          className={cn(
            "w-20 px-2 py-2.5 text-lg font-bold bg-th-s2 border border-th-bm rounded-lg text-th-t font-mono outline-none box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            alignClass,
            className,
          )}
        />
      </NumberField.Root>
      <span className="text-sm text-th-t4 font-mono">{suffix ?? unit}</span>
    </div>
  );
};
