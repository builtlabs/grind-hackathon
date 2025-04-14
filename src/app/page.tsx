import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { abstractTestnet } from '@/lib/chain';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container flex w-full grow items-center justify-center">
      <Card className="size-64">
        <CardHeader>
          <CardTitle>Block #1</CardTitle>
          <CardDescription>#blockhash</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter className="mt-auto justify-end border-t">
          <Button variant="link" className="p-0" asChild>
            <Link href={abstractTestnet.blockExplorers?.default.url + '/block/1'} target="_blank">
              View on {abstractTestnet.blockExplorers?.default.name}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
