export * from "./mysql.generator";

import { SchemaAST } from "@/packages/schema-core";
import { BaseGenerator } from "../base/Generator";
import { createMysqlGenerator } from "./mysql.generator";

/**
 * MySQLGenerator class adapter wrapping createMysqlGenerator closure.
 */
export class MySQLGenerator extends BaseGenerator {
    public generate(ast: SchemaAST): string {
        const generator = createMysqlGenerator();
        return generator.generate(ast);
    }
}
