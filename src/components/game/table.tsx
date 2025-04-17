import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

export const GameTable: React.FC = () => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-6 font-semibold">
        <div className="flex items-center gap-4">
          <Image
            src="https://grind.bearish.af/grindcoin.gif"
            width={540}
            height={540}
            alt="grindcoin"
            className="size-8"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total Bank</span>
            <span>$100,000</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Image
            src="https://grind.bearish.af/grindcoin.gif"
            width={540}
            height={540}
            alt="grindcoin"
            className="size-8"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-muted-foreground">Players</span>
            <span>20,237</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Image
            src="https://grind.bearish.af/grindcoin.gif"
            width={540}
            height={540}
            alt="grindcoin"
            className="size-8"
            unoptimized
          />
          <span className="text-muted-foreground text-base font-bold">Fair Game</span>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <Table className="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="*:data-[slot=table-head]:h-6">
              <TableHead>Wallet</TableHead>
              <TableHead>Bet</TableHead>
              <TableHead>X</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 15 }, (_, i) => (
              <TableRow key={i}>
                <TableCell>{`0x${i}`}</TableCell>
                <TableCell>$100</TableCell>
                <TableCell>2x</TableCell>
                <TableCell>--</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
