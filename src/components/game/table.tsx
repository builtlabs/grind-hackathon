import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const GameTable: React.FC = () => {
  return (
    <div className="h-96 w-64 overflow-hidden rounded border">
      <Table>
        <TableCaption>Current Bets.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Wallet</TableHead>
            <TableHead>Bet</TableHead>
            <TableHead>X</TableHead>
            <TableHead className="text-right">Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 15 }, (_, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{`0x${i}`}</TableCell>
              <TableCell>100</TableCell>
              <TableCell>100</TableCell>
              <TableCell className="text-right">200</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
