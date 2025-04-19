import { formatMultiplier, multipliers } from '@/lib/block-crash';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const MultiplierInput: React.FC = () => {
  const defaultIdx = (multipliers.length - 1).toString();

  return (
    <Select name="multiplier" defaultValue={defaultIdx}>
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
