import { NestExpressApplication } from "@nestjs/platform-express";
import { SpelunkerModule } from "nestjs-spelunker";

export function graphDependencies(app: NestExpressApplication): string {
  const tree = SpelunkerModule.explore(app, {
    ignoreImports: [/ConfigHostModule/, /MikroOrmCoreModule/],
  });
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  const mermaidEdges = edges.map(
    ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
  );
  return `
  \`\`\`mermaid
  graph TD
  ${mermaidEdges.join("\n")}
  \`\`\`
  `;
}
