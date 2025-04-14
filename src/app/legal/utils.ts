import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const metadataSchema = z.object({
  title: z.string(),
  publishedAt: z.string(),
  summary: z.string(),
  image: z.string().optional(),
});

function getMDFiles(dir: string) {
  return fs.readdirSync(dir).filter(file => path.extname(file) === '.md');
}

function readMDFile(filePath: string) {
  const rawMarkdown = fs.readFileSync(filePath, 'utf-8');
  const { data: metadata, content } = matter(rawMarkdown);

  const parsedMetadata = metadataSchema.parse(metadata);

  return { metadata: parsedMetadata, content };
}

function getMDData(dir: string) {
  const mdxFiles = getMDFiles(dir);
  return mdxFiles.map(file => {
    const { metadata, content } = readMDFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getLegalDocs() {
  return getMDData(path.join(process.cwd(), 'src', 'app', 'legal', 'docs'));
}
