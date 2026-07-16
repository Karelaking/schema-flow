import { DatabaseDialect } from "@/packages/schema-core";
import { CodeGenerator } from "../base/Generator";
import { SQLiteGenerator } from "../sqlite/SQLiteGenerator";

export class GeneratorFactory {
  private static generators: Record<DatabaseDialect, CodeGenerator> = {
    sqlite: new SQLiteGenerator(),
    postgres: new SQLiteGenerator(), // Placeholder fallback
    mysql: new SQLiteGenerator()     // Placeholder fallback
  };

  public static getGenerator(dialect: DatabaseDialect): CodeGenerator {
    const generator = this.generators[dialect];
    if (!generator) {
      throw new Error(`Unsupported database dialect: ${dialect}`);
    }
    return generator;
  }
}
