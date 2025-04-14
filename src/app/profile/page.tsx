import { redirect } from 'next/navigation';
import { getPrivyUser } from '@/server/privy';
import { ABSTRACT_APP_ID } from '@/lib/abstract';
import { CrossAppAccountWithMetadata } from '@privy-io/react-auth';

export default async function Page() {
  const privyUser = await getPrivyUser();

  if (!privyUser) {
    return redirect('/signin');
  }

  const account = privyUser.linkedAccounts.find(
    account => account.type === 'cross_app' && account.providerApp.id === ABSTRACT_APP_ID,
  ) as CrossAppAccountWithMetadata;

  return (
    <main className="container flex w-full grow items-center justify-center">
      PROFILE
      <span className="text-muted-foreground text-sm">
        {account.embeddedWallets[0].address}
      </span>
    </main>
  );
}
