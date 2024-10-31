"use client";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Loader } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface SearchResult {
  id: string;
  title: string;
  location: string;
  price?: number;
  photos?: string[];
  guide?: string;
  experience?: string;
  description?: string;
}

const DEBOUNCE_DELAY = 50;
const MIN_SEARCH_LENGTH = 2;

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search-suggestions?q=${encodeURIComponent(query)}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useDebouncedCallback(
    fetchSuggestions,
    DEBOUNCE_DELAY
  );

  useEffect(() => {
    if (searchQuery.length >= MIN_SEARCH_LENGTH) {
      debouncedFetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, debouncedFetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim().length >= MIN_SEARCH_LENGTH) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setShowSuggestions(false);
      }
    },
    [router]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: SearchResult) => {
      setSearchQuery(suggestion.title);
      setShowSuggestions(false);
      handleSearch(suggestion.title);
    },
    [handleSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      } else if (e.key === "Enter") {
        handleSearch(searchQuery);
      }
    },
    [handleSearch, searchQuery]
  );

  const suggestionsList = useMemo(
    () =>
      suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          onClick={() => handleSuggestionClick(suggestion)}
        >
          <div className="font-semibold text-gray-900">{suggestion.title}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>{suggestion.location}</span>
            {suggestion.guide && (
              <>
                <span className="text-gray-300">•</span>
                <span>{suggestion.guide}</span>
              </>
            )}
          </div>
        </div>
      )),
    [suggestions, handleSuggestionClick]
  );

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="flex items-center p-4 w-full bg-white text-black rounded-lg shadow-lg transition-shadow duration-200 hover:shadow-xl">
        <Search className="w-5 h-5 mr-2 text-gray-500" />
        <input
          type="search"
          placeholder="Search for trips, locations, or guides..."
          className="w-full focus:outline-none placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {isLoading && (
          <Loader className="w-3 h-3 animate-spin text-gray-500 ml-2" />
        )}
      </div>

      {showSuggestions && searchQuery.length >= MIN_SEARCH_LENGTH && (
        <div className="absolute z-auto w-full bg-white mt-1 rounded-sm shadow-lg max-h-96 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestionsList
          ) : (
            <div className="p-4 text-center text-gray-500">
              {isLoading ? "Searching..." : "No results found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;