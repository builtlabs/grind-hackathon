import { formatMultiplier, multipliers } from '@/lib/block-crash';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const MultiplierInput: React.FC = () => {
  return (
    <Select name="multiplier" defaultValue={(multipliers.length - 1).toString()}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="100x" />
      </SelectTrigger>
      <SelectContent>
        {multipliers.map((multiplier, index) => (
          <SelectItem key={multiplier} value={index.toString()}>
            {formatMultiplier(multiplier)}x
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
