import {CharStream, Parser, ParserRuleContext, Token} from "antlr4ng";
import {Issue} from "../validation";
import {Position} from "../model/position";
import {Node} from "../model/model";
import {CodeProcessingResult} from "../model/processing";
import "../interop/antlr4";

export enum TokenCategory {
    COMMENT = "Comment",
    KEYWORD = "Keyword",
    NUMERIC_LITERAL = "Numeric literal",
    STRING_LITERAL = "String literal",
    OTHER_LITERAL = "Other literal",
    PLAIN_TEXT = "Plain text",
    WHITESPACE = "Whitespace",
    IDENTIFIER = "Identifier",
    PUNCTUATION = "Punctuation",
    OPERATOR = "Operator",
}

/**
 * A token is a portion of text that has been assigned a category.
 */
export class TylasuToken {
    constructor(
        public readonly category: TokenCategory,
        public readonly position: Position,
        public readonly text?: string | undefined | null
    ) {}
}


/**
 * A [TylasuToken] generated from a [Token]. The [token] contains additional information that is specific to ANTLR,
 * such as type and channel.
 */
export class TylasuANTLRToken extends TylasuToken {

    constructor(category: TokenCategory, public readonly token: Token) {
        super(category, Position.ofToken(token), token.text);
    }
}

export class LexingResult<T extends TylasuToken> extends CodeProcessingResult<T[]> {

    time?: number;

    constructor(code: string, data: T[], issues: Issue[], time?: number) {
        super(code, data, issues);
        this.time = time;
    }
}

export class FirstStageParsingResult<C extends ParserRuleContext> extends CodeProcessingResult<C> {
    constructor(
        code: string, data: C, issues: Issue[],
        public readonly parser: Parser,
        public readonly time?: number,
        public readonly lexingTime?: number,
        public readonly incompleteNode?: Node) {
        super(code, data, issues);
    }

    get root(): C | undefined {
        return this.data;
    }
}

export class ParsingResult<RootNode extends Node> extends CodeProcessingResult<RootNode> {

    incompleteNode?: Node;
    firstStage?: FirstStageParsingResult<any>;
    time?: number;

    constructor(
        code: string, data: RootNode | undefined, issues: Issue[],
        incompleteNode?: Node, firstStage?: FirstStageParsingResult<any>, time?: number) {
        super(code, data, issues);
        this.incompleteNode = incompleteNode;
        this.firstStage = firstStage;
        this.time = time;
    }

    get root(): RootNode | undefined {
        return this.data;
    }
}

export interface TylasuLexer<T extends TylasuToken> {

    /**
     * Performs "lexing" on the given code stream or string, i.e., it breaks it into tokens.
     */
    lex(code: string | CharStream, onlyFromDefaultChannel?: boolean): LexingResult<T>;
}

