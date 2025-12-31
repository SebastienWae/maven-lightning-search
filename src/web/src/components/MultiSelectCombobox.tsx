import { CaretUpDownIcon, XIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Option<T extends string = string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

type MultiSelectComboboxProps<T extends string = string> = {
  /** Label shown in the trigger button */
  label: string;
  /** Available options to select from */
  options: Option<T>[];
  /** Currently selected values */
  selectedValues: T[];
  /** Callback when selection changes */
  onSelectionChange: (values: T[]) => void;
  /** Additional className for the trigger button */
  className?: string;
};

export function MultiSelectCombobox<T extends string = string>({
  label,
  options,
  selectedValues,
  onSelectionChange,
  className,
}: MultiSelectComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  // Use Set for O(1) lookups instead of O(n) array.includes()
  const selectedSet = React.useMemo(() => new Set(selectedValues), [selectedValues]);

  const allSelected = selectedValues.length === options.length;
  const noneSelected = selectedValues.length === 0;

  const toggleValue = (value: T) => {
    const updated = selectedSet.has(value) ? selectedValues.filter((v) => v !== value) : [...selectedValues, value];
    onSelectionChange(updated);
  };

  const selectAll = () => {
    onSelectionChange(options.map((o) => o.value));
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  // Determine trigger text
  const triggerText = noneSelected || allSelected ? `${label} (All)` : `${label} (${selectedValues.length})`;

  return (
    <div className={cn("flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="ghost" className="gap-1 px-2 font-medium">
              {triggerText}
              <CaretUpDownIcon size={14} className="text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent align="start" className="min-w-36 w-auto p-0">
          <Command>
            <CommandInput placeholder="Filter..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem data-checked={allSelected} onSelect={selectAll}>
                  Select all
                </CommandItem>
                <CommandItem onSelect={clearSelection} disabled={noneSelected}>
                  Clear
                  <span data-slot="command-shortcut" className="ml-auto">
                    <XIcon className={noneSelected ? "opacity-0" : "opacity-100"} />
                  </span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    data-checked={selectedSet.has(option.value)}
                    onSelect={() => toggleValue(option.value)}
                  >
                    {option.icon}
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
