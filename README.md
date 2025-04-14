# TODO

## Infrastructure
- Server side graphql query
  - Show a site status, to show if the graph is out of sync
- Block tick UI
  - Refetch the block from an api route
  - sync the refetch interval with the server revalidation period
  - Show the passing blocks with basic block info
- Test out some math using jest unit tests
  - Determine the probability the game reaches the end (50 blocks etc)
  - Determine the probability of a block being a crash (end game)
  - Test the probability using the block hash of the last 100 blocks

## Domain
- Register the domain
- Set up the domain with Vercel
- Set up the domain with Privy
  - Verify the domain with Privy
  - DNS config
- Make sure CSP is correct

## UI
- Incorporate the $GRIND assets
- A nice shadcn theme
  - Use the $GRIND colors
- Use the $GRIND font

## MVP+
- Auto betting by approving a total pot, such as $25 for 10 rounds
- Use the Privy [Server Sessions](https://docs.privy.io/wallets/using-wallets/server-sessions/overview) to reduce the pop-ups
  - does the max spend limit make this useless?

## Auth
- Sign in with Abstract wallet, all thats needed?

## Documentation
- Site metadata
- icons
- open graph images
- Legal documentation
  - Legal metadata and urls
- Licence if its going to be open source
