import { SchemaAST } from "@/packages/schema-core";

/**
 * Interface defining code generator contract.
 */
export interface CodeGenerator {
    generate: (ast: SchemaAST) => string;
}

/**
 * Helper closure function to format SQL comments.
 * @param commentText Raw comment text.
 * @returns Formatted SQL comment line.
 */
export const formatSqlComment = (commentText: string): string => {
    return `-- ${commentText}`;
};
