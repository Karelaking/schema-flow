import { DatabaseDialect } from "@/packages/schema-core";
import { CodeGenerator } from "../base/base.generator";
import { createSqliteGenerator } from "../sqlite/sqlite.generator";
import { createPostgresqlGenerator } from "../postgres/postgresql.generator";
import { createMysqlGenerator } from "../mysql/mysql.generator";

/**
 * Closure function returning appropriate CodeGenerator for a database dialect.
 * @param dialect Target database dialect.
 * @returns CodeGenerator closure instance.
 */
export const getGeneratorForDialect = (dialect: DatabaseDialect): CodeGenerator => {
    const generators: Record<DatabaseDialect, () => CodeGenerator> = {
        sqlite: createSqliteGenerator,
        postgres: createPostgresqlGenerator,
        mysql: createMysqlGenerator,
    };

    const generatorFactory = generators[dialect];
    if (!generatorFactory) {
        throw new Error(`Unsupported database dialect: ${dialect}`);
    }

    return generatorFactory();
};
