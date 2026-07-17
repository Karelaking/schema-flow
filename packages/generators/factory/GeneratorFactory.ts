import { DatabaseDialect } from "@/packages/schema-core";
import { CodeGenerator } from "../base/Generator";
import { SQLiteGenerator } from "../sqlite/SQLiteGenerator";
import { PostgreSQLGenerator } from "../postgres/PostgreSQLGenerator";
import { MySQLGenerator } from "../mysql/MySQLGenerator";

export class GeneratorFactory {
  private static generators: Record<DatabaseDialect, CodeGenerator> = {
    sqlite: new SQLiteGenerator(),
    postgres: new PostgreSQLGenerator(),
    mysql: new MySQLGenerator()
  };

  public static getGenerator(dialect: DatabaseDialect): CodeGenerator {
    const generator = this.generators[dialect];
    if (!generator) {
      throw new Error(`Unsupported database dialect: ${dialect}`);
    }
    return generator;
  }
}
