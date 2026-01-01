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

export type Option<T extends string | number> = {
  key: T;
  value: string;
  icon?: React.ReactNode;
};

type MultiSelectComboboxProps<T extends string | number> = {
  label: string;
  options: Option<T>[];
  selectedValues: T[];
  onSelectionChange: (values: T[]) => void;
  className?: React.ComponentProps<"div">["className"];
};

export function MultiSelectCombobox<T extends string | number>({
  label,
  options,
  selectedValues,
  onSelectionChange,
  className,
}: MultiSelectComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const allSelected = selectedValues.length === options.length;
  const noneSelected = selectedValues.length === 0;

  const toggleValue = (value: T) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(updated);
  };

  const selectAll = () => {
    onSelectionChange(options.map((o) => o.key));
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

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
                    key={option.key}
                    value={option.value}
                    data-checked={selectedValues.includes(option.key)}
                    onSelect={() => toggleValue(option.key)}
                  >
                    {option.icon}
                    {option.value}
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
