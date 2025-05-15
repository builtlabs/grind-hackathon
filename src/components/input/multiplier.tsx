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
    <Select name="multiplier">
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select multiplier" />
      </SelectTrigger>
      <SelectContent>
        {multipliers.map((multiplier, index) => (
          <SelectItem key={multiplier} value={index.toString()}>
            Block {index + 1} ({formatMultiplier(multiplier)}x)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
