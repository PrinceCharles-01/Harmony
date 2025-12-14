import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, Calendar, BookOpen, GraduationCap } from "lucide-react";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  placeholder?: string;
  type?: 'grades' | 'schedule' | 'general';
}

interface FilterOptions {
  semester?: string;
  ue?: string;
  type?: string;
  dateRange?: string;
  professor?: string;
}

export const SearchFilter = ({ 
  onSearch, 
  onFilter, 
  placeholder = "Rechercher...", 
  type = 'general' 
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const getFilterOptions = () => {
    switch (type) {
      case 'grades':
        return {
          semesters: ['S1', 'S2', 'S3', 'S4'],
          ues: ['UE1 - Algorithmique', 'UE2 - Systèmes', 'UE3 - IA', 'UE4 - Projet'],
          types: ['Contrôle Continu', 'Examen', 'Projet', 'TP']
        };
      case 'schedule':
        return {
          types: ['Cours Magistral', 'Travaux Dirigés', 'Travaux Pratiques', 'Examen', 'Projet'],
          professors: ['Dr. Martin', 'Mme Dubois', 'M. Leroy', 'Dr. Chen', 'M. Bernard'],
          dateRanges: ['Cette semaine', 'Ce mois', 'Ce semestre']
        };
      default:
        return {
          categories: ['Notes', 'Planning', 'Actualités', 'Profil']
        };
    }
  };

  const filterOptions = getFilterOptions();
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-3">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 glass"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => handleSearch('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="glass">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 glass-card border-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filtres</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Tout effacer
                  </Button>
                )}
              </div>

              {/* Filtres par type */}
              {type === 'grades' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Semestre</label>
                    <Select value={activeFilters.semester || 'all'} onValueChange={(value) => updateFilter('semester', value)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="all">Tous les semestres</SelectItem>
                        {filterOptions.semesters?.map(semester => (
                          <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Unité d'Enseignement</label>
                    <Select value={activeFilters.ue || 'all'} onValueChange={(value) => updateFilter('ue', value)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="all">Toutes les UE</SelectItem>
                        {filterOptions.ues?.map(ue => (
                          <SelectItem key={ue} value={ue}>{ue}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type d'évaluation</label>
                    <Select value={activeFilters.type || 'all'} onValueChange={(value) => updateFilter('type', value)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="all">Tous les types</SelectItem>
                        {filterOptions.types?.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {type === 'schedule' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de cours</label>
                    <Select value={activeFilters.type || 'all'} onValueChange={(value) => updateFilter('type', value)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="all">Tous les types</SelectItem>
                        {filterOptions.types?.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Professeur</label>
                    <Select value={activeFilters.professor || 'all'} onValueChange={(value) => updateFilter('professor', value)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="all">Tous les professeurs</SelectItem>
                        {filterOptions.professors?.map(prof => (
                          <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Période</label>
                    <Select value={activeFilters.dateRange || 'all'} onValueChange={(value) => updateFilter('dateRange', value)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="all">Toutes les périodes</SelectItem>
                        {filterOptions.dateRanges?.map(range => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Badges des filtres actifs */}
        {Object.entries(activeFilters).map(([key, value]) => (
          <Badge key={key} variant="secondary" className="glass">
            {value}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 hover:bg-destructive/20"
              onClick={() => clearFilter(key as keyof FilterOptions)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};