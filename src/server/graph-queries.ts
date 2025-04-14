import { GET_BLOCK_NUMBER, GET_GAME } from '@/lib/graph';
import { GetBlockNumberQuery, type GetGameQuery } from '@/graph/graphql';
import { type Response, fetchGraphQL } from './graph';

export async function getGame(id: `0x${string}-${number}`): Promise<Response<GetGameQuery>> {
  return fetchGraphQL({
    document: GET_GAME,
    variables: {
      id: id.toLowerCase(),
    },
  });
}

export async function getBlockNumber(): Promise<Response<GetBlockNumberQuery>> {
  return fetchGraphQL({
    document: GET_BLOCK_NUMBER,
  });
}
