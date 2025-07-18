"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Faculty {
  id: string;
  name: string;
  department: string;
}

interface CoAuthorSelectorProps {
  selectedCoAuthors: Faculty[];
  onCoAuthorsChange: (coAuthors: Faculty[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function CoAuthorSelector({
  selectedCoAuthors,
  onCoAuthorsChange,
  label = "Co-Authors",
  placeholder = "Search for faculty co-authors...",
  className,
}: CoAuthorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Faculty[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 0) {
        searchFaculty(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchFaculty = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/faculty/autocomplete?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success) {
        // Filter out already selected co-authors
        const filteredSuggestions = data.data.filter(
          (faculty: Faculty) =>
            !selectedCoAuthors.some((selected) => selected.id === faculty.id)
        );
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error searching faculty:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCoAuthor = (faculty: Faculty) => {
    if (!selectedCoAuthors.some((selected) => selected.id === faculty.id)) {
      onCoAuthorsChange([...selectedCoAuthors, faculty]);
    }
    setSearchTerm("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveCoAuthor = (facultyId: string) => {
    onCoAuthorsChange(
      selectedCoAuthors.filter((faculty) => faculty.id !== facultyId)
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        <span className="text-xs text-gray-500 ml-1">
          (Select faculty from your college)
        </span>
      </Label>

      {/* Selected Co-Authors */}
      {selectedCoAuthors.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50">
          {selectedCoAuthors.map((faculty) => (
            <Badge
              key={faculty.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Users className="h-3 w-3" />
              {faculty.name}
              <span className="text-xs text-gray-500">
                ({faculty.department})
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveCoAuthor(faculty.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="pl-10"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((faculty) => (
                <button
                  key={faculty.id}
                  type="button"
                  className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 focus:outline-none focus:bg-gray-50"
                  onClick={() => handleSelectCoAuthor(faculty)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{faculty.name}</div>
                      <div className="text-xs text-gray-500">
                        ID: {faculty.id}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {faculty.department}
                    </Badge>
                  </div>
                </button>
              ))
            ) : searchTerm.length > 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No faculty found matching "{searchTerm}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        {selectedCoAuthors.length > 0
          ? `${selectedCoAuthors.length} co-author${
              selectedCoAuthors.length > 1 ? "s" : ""
            } selected`
          : "You will be listed as the primary author. Add co-authors from your college here."}
      </div>
    </div>
  );
}
