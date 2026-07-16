import { SchemaAST } from "@/packages/schema-core";

export interface CodeGenerator {
  generate(ast: SchemaAST): string;
}

export abstract class BaseGenerator implements CodeGenerator {
  protected formatComment(text: string): string {
    return `-- ${text}`;
  }

  public abstract generate(ast: SchemaAST): string;
}
