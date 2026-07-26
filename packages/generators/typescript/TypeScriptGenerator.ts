export * from "./typescript.generator";

import { SchemaAST } from "@/packages/schema-core";
import { CodeGenerator } from "../base/Generator";
import { createTypescriptGenerator } from "./typescript.generator";

/**
 * TypeScriptGenerator class adapter wrapping createTypescriptGenerator closure.
 */
export class TypeScriptGenerator implements CodeGenerator {
    public generate(ast: SchemaAST): string {
        const generator = createTypescriptGenerator();
        return generator.generate(ast);
    }
}
