import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Users, MapPin, Check, X, ChevronDown, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ==================== RELIGIOUS PRACTICES ====================

interface ReligiousPractice {
  id: string;
  label: string;
  category: 'prayer' | 'fasting' | 'charity' | 'community' | 'study';
  popularity: number; // 0-100
}

const RELIGIOUS_PRACTICES: ReligiousPractice[] = [
  { id: 'five_daily_prayers', label: 'Five Daily Prayers', category: 'prayer', popularity: 95 },
  { id: 'friday_prayers', label: 'Friday Prayers', category: 'prayer', popularity: 90 },
  { id: 'tahajjud', label: 'Tahajjud (Night Prayer)', category: 'prayer', popularity: 45 },
  { id: 'ramadan_fasting', label: 'Ramadan Fasting', category: 'fasting', popularity: 98 },
  { id: 'voluntary_fasting', label: 'Voluntary Fasting', category: 'fasting', popularity: 60 },
  { id: 'zakat', label: 'Zakat (Annual Charity)', category: 'charity', popularity: 92 },
  { id: 'sadaqah', label: 'Regular Sadaqah', category: 'charity', popularity: 75 },
  { id: 'quran_recitation', label: 'Quran Recitation', category: 'study', popularity: 85 },
  { id: 'islamic_classes', label: 'Islamic Classes', category: 'study', popularity: 55 },
  { id: 'mosque_attendance', label: 'Regular Mosque Attendance', category: 'community', popularity: 70 },
];

interface ReligiousPracticesSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  userLocation?: string;
  className?: string;
}

export const ReligiousPracticesSelector = ({
  selected,
  onChange,
  userLocation,
  className
}: ReligiousPracticesSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredPractices = useMemo(() => {
    return RELIGIOUS_PRACTICES.filter(practice => {
      const matchesSearch = practice.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || practice.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => b.popularity - a.popularity);
  }, [searchQuery, filterCategory]);

  const topPractices = useMemo(() => {
    return RELIGIOUS_PRACTICES.filter(p => p.popularity >= 80).slice(0, 5);
  }, []);

  const togglePractice = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Suggestions */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <h4 className="text-sm font-bold text-foreground">Most Common Practices</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {topPractices.map(practice => (
            <PracticeChip
              key={practice.id}
              practice={practice}
              isSelected={selected.includes(practice.id)}
              onClick={() => togglePractice(practice.id)}
            />
          ))}
        </div>
      </div>

      {/* Location-based suggestion */}
      {userLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-muted-foreground">
              Users from <span className="font-semibold text-foreground">{userLocation}</span> often select:
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Friday Prayers
            </Badge>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search practices..."
            className="pl-10"
          />
        </div>
        <CategoryFilter value={filterCategory} onChange={setFilterCategory} />
      </div>

      {/* Practice Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
        {filteredPractices.map(practice => (
          <PracticeCard
            key={practice.id}
            practice={practice}
            isSelected={selected.includes(practice.id)}
            onClick={() => togglePractice(practice.id)}
          />
        ))}
      </div>
    </div>
  );
};

// ==================== CAREER SELECTOR ====================

interface Career {
  id: string;
  title: string;
  industry: string;
  relatedSkills: string[];
  popularity: number;
}

const CAREERS: Career[] = [
  { id: 'software_engineer', title: 'Software Engineer', industry: 'Technology', relatedSkills: ['Programming', 'Problem Solving', 'Teamwork'], popularity: 85 },
  { id: 'doctor', title: 'Doctor', industry: 'Healthcare', relatedSkills: ['Medical Knowledge', 'Empathy', 'Decision Making'], popularity: 90 },
  { id: 'teacher', title: 'Teacher', industry: 'Education', relatedSkills: ['Communication', 'Patience', 'Subject Expertise'], popularity: 80 },
  { id: 'accountant', title: 'Accountant', industry: 'Finance', relatedSkills: ['Numbers', 'Attention to Detail', 'Regulations'], popularity: 75 },
  { id: 'engineer', title: 'Engineer', industry: 'Engineering', relatedSkills: ['Technical Design', 'Mathematics', 'Innovation'], popularity: 82 },
];

interface CareerSelectorProps {
  selected: string;
  onChange: (careerId: string, skills: string[]) => void;
  className?: string;
}

export const CareerSelector = ({
  selected,
  onChange,
  className
}: CareerSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCareer = CAREERS.find(c => c.id === selected);

  const filteredCareers = useMemo(() => {
    return CAREERS.filter(career =>
      career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelect = (career: Career) => {
    onChange(career.id, career.relatedSkills);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Selected Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-border rounded-lg p-3 hover:border-primary transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedCareer ? (
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedCareer.title}</p>
                <p className="text-xs text-muted-foreground">{selectedCareer.industry}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select your profession...</p>
            )}
          </div>
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-border rounded-xl shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search professions..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Career List */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCareers.map(career => (
                <button
                  key={career.id}
                  onClick={() => handleSelect(career)}
                  className={cn(
                    "w-full p-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0",
                    selected === career.id && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{career.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{career.industry}</p>
                      <div className="flex flex-wrap gap-1">
                        {career.relatedSkills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selected === career.id && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-populated Skills */}
      {selectedCareer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-foreground">Auto-populated Skills:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCareer.relatedSkills.map(skill => (
              <Badge key={skill} className="bg-green-100 text-green-700 border-green-300">
                {skill}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

interface PracticeChipProps {
  practice: ReligiousPractice;
  isSelected: boolean;
  onClick: () => void;
}

const PracticeChip = ({ practice, isSelected, onClick }: PracticeChipProps) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2",
      isSelected
        ? "bg-green-500 text-white border-green-600"
        : "bg-white text-foreground border-border hover:border-green-300"
    )}
  >
    {practice.label}
  </motion.button>
);

interface PracticeCardProps {
  practice: ReligiousPractice;
  isSelected: boolean;
  onClick: () => void;
}

const PracticeCard = ({ practice, isSelected, onClick }: PracticeCardProps) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "p-3 rounded-lg border-2 transition-all text-left",
      isSelected
        ? "bg-green-50 border-green-500"
        : "bg-white border-border hover:border-green-300"
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{practice.label}</p>
        <Badge variant="secondary" className="text-xs mt-1">
          {practice.category}
        </Badge>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
        isSelected ? "bg-green-500 border-green-600" : "border-border"
      )}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
    </div>
  </motion.button>
);

interface CategoryFilterProps {
  value: string | null;
  onChange: (category: string | null) => void;
}

const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => {
  const categories = ['prayer', 'fasting', 'charity', 'community', 'study'];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(value ? null : 'prayer')}
        className="min-w-[100px]"
      >
        <Filter className="w-4 h-4 mr-2" />
        {value || 'Filter'}
      </Button>
    </div>
  );
};
