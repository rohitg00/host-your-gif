import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounce";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const debouncedChange = useDebouncedCallback((value: string) => {
    onChange(value);
  }, 300);

  return (
    <Input
      type="search"
      placeholder="Search GIFs..."
      className="w-full md:w-[300px]"
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;
        onChange(newValue);
        debouncedChange(newValue);
      }}
    />
  );
}
