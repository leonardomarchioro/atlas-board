import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TAG_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#0891B2",
] as const;

export function TagColorPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  const visibleColors = TAG_COLORS.slice(0, 6);
  const normalizedValue = value.toUpperCase();
  const customColorSelected = !visibleColors.some((color) => color === normalizedValue);

  return (
    <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label="Cor da tag">
      {visibleColors.map((color) => {
        const selected = normalizedValue === color;
        return (
          <button
            key={color}
            type="button"
            className="flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: color }}
            role="radio"
            aria-checked={selected}
            aria-label={`Selecionar cor ${color}`}
            disabled={disabled}
            onClick={() => onChange(color)}
          >
            {selected ? <Check className="size-4 text-white" aria-hidden /> : null}
          </button>
        );
      })}
      <span className="mx-0.5 h-6 w-px bg-border" aria-hidden />
      
      <label className="relative">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-label={
            customColorSelected
              ? `Alterar cor personalizada selecionada: ${normalizedValue}`
              : "Selecionar cor personalizada"
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="pointer-events-none text-muted-foreground"
          disabled={disabled}
          tabIndex={-1}
        >
          <Palette aria-hidden />
          Customizada
        </Button>
      </label>
        {customColorSelected ? (
        <span
          className="flex size-8 items-center justify-center rounded-full"
          style={{ backgroundColor: normalizedValue }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
