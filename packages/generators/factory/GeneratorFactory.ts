export * from "./generator.factory";

import { DatabaseDialect } from "@/packages/schema-core";
import { CodeGenerator } from "../base/Generator";
import { getGeneratorForDialect } from "./generator.factory";

/**
 * Class wrapper for getGeneratorForDialect for backward compatibility.
 */
export class GeneratorFactory {
    public static getGenerator(dialect: DatabaseDialect): CodeGenerator {
        return getGeneratorForDialect(dialect);
    }
}
