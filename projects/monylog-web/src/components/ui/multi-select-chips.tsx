"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectChipsProps {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  placeholder = "태그 선택",
}: MultiSelectChipsProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (option: Option) => {
    if (selected.some((t) => t.id === option.id)) {
      onChange(selected.filter((t) => t.id !== option.id));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full flex justify-between items-center"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex flex-wrap gap-1 items-center min-h-[1.5rem]">
          {selected.length === 0 ? (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          ) : (
            selected.map((tag) => (
              <Badge key={tag.id} className="mr-1">
                {tag.name}
              </Badge>
            ))
          )}
        </div>
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      {open && (
        <div
          className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = selected.some((t) => t.id === option.id);
            return (
              <div
                key={option.id}
                className={`flex items-center px-3 py-2 cursor-pointer hover:bg-accent ${isSelected ? "bg-accent/50" : ""}`}
                onClick={() => handleToggle(option)}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleToggle(option);
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="mr-2"
                  tabIndex={-1}
                />
                <span>{option.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
