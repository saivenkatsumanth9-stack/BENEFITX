import { useState } from "react";
import { Filter, RotateCcw, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SchemeCategory, GovernmentLevel, SortKey, SchemeFilters } from "@/lib/types";

const CATEGORIES: SchemeCategory[] = [
  "Education",
  "Agriculture",
  "Health",
  "Employment",
  "Housing",
  "Women & Child",
  "Entrepreneurship",
  "Social Security",
];

const STATES = [
  "All India",
  "Telangana",
  "Andhra Pradesh",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Delhi",
  "Uttar Pradesh",
];

const EDUCATION_LEVELS = [
  "10th Pass",
  "12th Pass",
  "Undergraduate",
  "Graduate",
  "Postgraduate",
];

const OCCUPATIONS = [
  "Student",
  "Farmer",
  "Salaried",
  "Self-employed",
  "Daily wage worker",
  "Unemployed",
  "Homemaker",
  "Retired",
];

interface FilterBarProps {
  filters: SchemeFilters;
  onFilterChange: (filters: SchemeFilters) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  resultCount?: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  sort,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const handleQueryChange = (q: string) => {
    onFilterChange({ ...filters, query: q });
  };

  const handleCategoryChange = (val: string) => {
    onFilterChange({
      ...filters,
      categories: val === "ALL" ? undefined : [val as SchemeCategory],
    });
  };

  const handleStateChange = (val: string) => {
    onFilterChange({
      ...filters,
      states: val === "ALL" ? undefined : [val],
    });
  };

  const handleLevelChange = (val: string) => {
    onFilterChange({
      ...filters,
      governmentLevels: val === "ALL" ? undefined : [val as GovernmentLevel],
    });
  };

  const handleEducationChange = (val: string) => {
    onFilterChange({
      ...filters,
      educationLevels: val === "ALL" ? undefined : [val as never],
    });
  };

  const handleOccupationChange = (val: string) => {
    onFilterChange({
      ...filters,
      occupations: val === "ALL" ? undefined : [val as never],
    });
  };

  const handleClear = () => {
    onFilterChange({});
    onSortChange("match");
  };

  const hasActiveFilters =
    Boolean(filters.query) ||
    Boolean(filters.categories?.length) ||
    Boolean(filters.states?.length) ||
    Boolean(filters.governmentLevels?.length) ||
    Boolean(filters.educationLevels?.length) ||
    Boolean(filters.occupations?.length) ||
    Boolean(filters.ageGroup) ||
    sort !== "match";

  return (
    <div className="surface-card p-4 space-y-3.5 shadow-sm">
      {/* Primary Bar: Search, Category, Sort, Expand toggle */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Filter schemes by name, keyword, or benefits..."
            value={filters.query || ""}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <Select
            value={filters.categories?.[0] || "ALL"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[145px] h-10 rounded-xl text-xs font-semibold bg-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sort} onValueChange={(val) => onSortChange(val as SortKey)}>
            <SelectTrigger className="w-[145px] h-10 rounded-xl text-xs font-semibold bg-card">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="size-3 text-muted-foreground" />
                <SelectValue placeholder="Sort By" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="benefit">Highest Benefit</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="deadline">Approaching Deadline</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>

          {/* More Filters Toggle Button */}
          <Button
            variant={expanded ? "secondary" : "outline"}
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-10 rounded-xl px-3 text-xs font-semibold gap-1.5"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>{expanded ? "Less" : "Filters"}</span>
            {hasActiveFilters && (
              <span className="size-2 rounded-full bg-primary" />
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive"
              title="Reset all filters"
            >
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Multi-Criteria Filter Grid */}
      {expanded && (
        <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in slide-in-from-top-2 duration-200">
          {/* State Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              State / Region
            </label>
            <Select
              value={filters.states?.[0] || "ALL"}
              onValueChange={handleStateChange}
            >
              <SelectTrigger className="w-full h-9 rounded-lg text-xs bg-card">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-56">
                <SelectItem value="ALL">All States / Central</SelectItem>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Government Level Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Govt Level
            </label>
            <Select
              value={filters.governmentLevels?.[0] || "ALL"}
              onValueChange={handleLevelChange}
            >
              <SelectTrigger className="w-full h-9 rounded-lg text-xs bg-card">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">All Govt Levels</SelectItem>
                <SelectItem value="Central">Central Govt</SelectItem>
                <SelectItem value="State">State Govt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Education Level */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Education
            </label>
            <Select
              value={filters.educationLevels?.[0] || "ALL"}
              onValueChange={handleEducationChange}
            >
              <SelectTrigger className="w-full h-9 rounded-lg text-xs bg-card">
                <SelectValue placeholder="Any Education" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Any Education</SelectItem>
                {EDUCATION_LEVELS.map((ed) => (
                  <SelectItem key={ed} value={ed}>
                    {ed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occupation */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Occupation
            </label>
            <Select
              value={filters.occupations?.[0] || "ALL"}
              onValueChange={handleOccupationChange}
            >
              <SelectTrigger className="w-full h-9 rounded-lg text-xs bg-card">
                <SelectValue placeholder="Any Occupation" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Any Occupation</SelectItem>
                {OCCUPATIONS.map((occ) => (
                  <SelectItem key={occ} value={occ}>
                    {occ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results summary bar */}
      {resultCount !== undefined && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Showing <strong className="text-foreground font-bold">{resultCount}</strong> government opportunities
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="text-primary hover:underline font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
