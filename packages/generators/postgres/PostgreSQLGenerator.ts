export * from "./postgresql.generator";

import { SchemaAST } from "@/packages/schema-core";
import { BaseGenerator } from "../base/Generator";
import { createPostgresqlGenerator } from "./postgresql.generator";

/**
 * PostgreSQLGenerator class adapter wrapping createPostgresqlGenerator closure.
 */
export class PostgreSQLGenerator extends BaseGenerator {
    public generate(ast: SchemaAST): string {
        const generator = createPostgresqlGenerator();
        return generator.generate(ast);
    }
}
