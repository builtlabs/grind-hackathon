import { GraphQLClient, type RequestOptions, type Variables } from 'graphql-request';
import { env } from '@/env.mjs';

const alchemyClient = new GraphQLClient(env.ALCHEMY_GRAPH_URL, {
  fetch,
  cache: 'no-cache',
});

export type Response<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export async function fetchGraphQL<T, V extends Variables = Variables>(
  props: RequestOptions<V, T>
): Promise<Response<T>> {
  try {
    const data = await alchemyClient.request(props);

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error(`GraphQL request failed`, error);

    return {
      data: null,
      error: 'Failed to fetch data',
    };
  }
}
