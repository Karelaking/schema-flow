export * from "./sqlite.generator";

import { SchemaAST } from "@/packages/schema-core";
import { BaseGenerator } from "../base/Generator";
import { createSqliteGenerator } from "./sqlite.generator";

/**
 * SQLiteGenerator class adapter wrapping createSqliteGenerator closure.
 */
export class SQLiteGenerator extends BaseGenerator {
    public generate(ast: SchemaAST): string {
        const generator = createSqliteGenerator();
        return generator.generate(ast);
    }
}
