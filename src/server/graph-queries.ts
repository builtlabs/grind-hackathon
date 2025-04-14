import { GET_GAME } from '@/lib/graph';
import { type GetGameQuery } from '@/graph/graphql';
import { type Response, fetchGraphQL } from './graph';

export async function getGame(id: `0x${string}-${number}`): Promise<Response<GetGameQuery>> {
  return fetchGraphQL({
    document: GET_GAME,
    variables: {
      id: id.toLowerCase(),
    },
  });
}
