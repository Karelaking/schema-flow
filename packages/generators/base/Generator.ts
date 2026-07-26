export * from "./base.generator";

import { SchemaAST } from "@/packages/schema-core";
import { CodeGenerator, formatSqlComment } from "./base.generator";

/**
 * BaseGenerator adapter maintaining class compatibility where required.
 */
export abstract class BaseGenerator implements CodeGenerator {
    protected formatComment(text: string): string {
        return formatSqlComment(text);
    }

    public abstract generate(ast: SchemaAST): string;
}
