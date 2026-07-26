export * from "./validation.service";

import { SchemaAST } from "@/packages/schema-core";
import { ValidationError, ValidationRule, validateSchema } from "./validation.service";

/**
 * Class wrapper for SchemaValidator maintaining backward compatibility.
 */
export class SchemaValidator {
    private rules?: ValidationRule[];

    constructor(customRules?: ValidationRule[]) {
        this.rules = customRules;
    }

    public validate(ast: SchemaAST): ValidationError[] {
        return validateSchema(ast, this.rules);
    }
}
