import { graphql } from '@/graph';

export const GameParts = graphql(`
  fragment GameParts on Game {
    id
    gameId
    playerOne {
      id
    }
    playerTwo {
      id
    }
    winningScore
    attempts(orderBy: attempt) {
      result
      playerOne {
        id
        move
      }
      playerTwo {
        id
        move
      }
    }
    state
    result
    token {
      id
    }
    stake
    interval
    timeout
    invite {
      invited {
        id
      }
    }
  }
`);

export const GET_GAME = graphql(`
  query GetGame($id: ID!) {
    game(id: $id) {
      ...GameParts
    }
  }
`);
