// FilterComponents.tsx
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterIcon } from 'lucide-react';

interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  yearsOfExperience: number[];
  languagesSpoken: string[];
}

interface FilterComponentsProps {
  filterOptions: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: any) => void;
}

const FilterComponents: React.FC<FilterComponentsProps> = ({ filterOptions, onFilterChange }) => {
  const languages = ['English', 'French', 'Thai', 'Chinese', 'Spanish', 'Vietnamese'];
  const experienceYears = [0, 1, 2, 3, 5, 10];

  // Provide default values if filterOptions is undefined
  const safeFilterOptions: FilterOptions = {
    minPrice: filterOptions?.minPrice ?? 0,
    maxPrice: filterOptions?.maxPrice ?? 1000,
    yearsOfExperience: filterOptions?.yearsOfExperience ?? [],
    languagesSpoken: filterOptions?.languagesSpoken ?? [],
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FilterIcon size={16} />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="flex items-center space-x-2">
              <span>${safeFilterOptions.minPrice}</span>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[safeFilterOptions.minPrice, safeFilterOptions.maxPrice]}
                onValueChange={(value) => {
                  onFilterChange('minPrice', value[0]);
                  onFilterChange('maxPrice', value[1]);
                }}
              />
              <span>${safeFilterOptions.maxPrice}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Years of Experience</h3>
            {experienceYears.map((years) => (
              <div key={years} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${years}`}
                  checked={safeFilterOptions.yearsOfExperience.includes(years)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFilterChange('yearsOfExperience', [...safeFilterOptions.yearsOfExperience, years]);
                    } else {
                      onFilterChange('yearsOfExperience', safeFilterOptions.yearsOfExperience.filter((y) => y !== years));
                    }
                  }}
                />
                <Label htmlFor={`exp-${years}`}>{years}+ years</Label>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Languages Spoken</h3>
            {languages.map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${lang}`}
                  checked={safeFilterOptions.languagesSpoken.includes(lang)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFilterChange('languagesSpoken', [...safeFilterOptions.languagesSpoken, lang]);
                    } else {
                      onFilterChange('languagesSpoken', safeFilterOptions.languagesSpoken.filter((l) => l !== lang));
                    }
                  }}
                />
                <Label htmlFor={`lang-${lang}`}>{lang}</Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterComponents;