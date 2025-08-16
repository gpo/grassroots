import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var generator = new PluginMetadataGenerator();
generator.generate({
    visitors: [
        new ReadonlyVisitor({
            introspectComments: true,
            pathToSource: __dirname
        })
    ],
    outputDir: __dirname,
    watch: false,
    tsconfigPath: "tsconfig.json"
});
