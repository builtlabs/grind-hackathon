import privy from './privy';
import vercelPreview from './vercel-preview';
import google from './google';
import development from './development';
import alchemy from './alchemy';
import viem from './viem';
import app from './app';

export const sources = [privy, vercelPreview, google, development, alchemy, viem, app] as const;
