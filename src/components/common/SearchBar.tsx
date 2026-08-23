import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Sparkles, Building2, MapPin, ArrowRight, IndianRupee } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SCHEMES } from "@/data/schemes";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchBar({ open, onOpenChange }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelectScheme = (schemeId: string) => {
    onOpenChange(false);
    navigate({ to: "/schemes/$id", params: { id: schemeId } });
  };

  const handleSelectRoute = (path: string) => {
    onOpenChange(false);
    navigate({ to: path as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search government schemes, benefits, categories, or keywords..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[380px] overflow-y-auto p-2">
        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
          No schemes found matching &ldquo;{query}&rdquo;. Try another term like &ldquo;scholarship&rdquo;, &ldquo;farmer&rdquo;, or &ldquo;housing&rdquo;.
        </CommandEmpty>

        <CommandGroup heading="Quick Navigation">
          <CommandItem
            onSelect={() => handleSelectRoute("/dashboard")}
            className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="font-medium">My Citizen Dashboard</span>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelectRoute("/recommendations")}
            className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-teal" />
              <span className="font-medium">AI Recommended Schemes</span>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelectRoute("/documents")}
            className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs bg-muted px-1.5 py-0.5 rounded">DOCS</span>
              <span className="font-medium">Document Locker & Checklist</span>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Government Schemes">
          {SCHEMES.map((scheme) => (
            <CommandItem
              key={scheme.id}
              value={`${scheme.name} ${scheme.category} ${scheme.benefitSummary} ${scheme.state} ${scheme.tags.join(" ")}`}
              onSelect={() => handleSelectScheme(scheme.id)}
              className="flex flex-col items-start gap-1.5 rounded-lg px-3 py-2.5 cursor-pointer aria-selected:bg-accent/60"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="font-semibold text-foreground text-sm line-clamp-1">{scheme.name}</span>
                <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
                  {scheme.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {scheme.shortDescription}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                <span className="flex items-center gap-0.5 text-saffron-foreground font-semibold">
                  <IndianRupee className="size-3" />
                  {scheme.benefitSummary}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="size-3" />
                  {scheme.governmentLevel}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {scheme.state}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
