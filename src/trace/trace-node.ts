import {Node, NodeDefinition} from "../model/model";
import {Position} from "../model/position";
import {Issue} from "../validation";

export abstract class ExternalNode extends Node {
    abstract parent?: ExternalNode;
    abstract get nodeDefinition(): NodeDefinition;

    abstract get(...path: string[]): ExternalNode | undefined;

    abstract getAttributes(): { [name: string]: any };

    getChildren(name?: string | symbol): ExternalNode[] {
        return super.getChildren(name).map(c => c as ExternalNode);
    }

    abstract getId(): string;

    abstract getIssues(property?: string): Issue[] | undefined;

    abstract getPosition(property?: string): Position | undefined;

    abstract getRole(): string | undefined;

    abstract isDeclaration(): boolean;

    abstract isExpression(): boolean;

    abstract isStatement(): boolean;

    equals(other: ExternalNode) {
        return other == this;
    }
}

export class AugmentedNode extends ExternalNode {
    constructor(protected node: Node) {
        super();
    }

    get parent() {
        if (this.node.parent) {
            return new AugmentedNode(this.node.parent);
        }
    }

    get nodeDefinition() {
        return this.node.nodeDefinition;
    }

    setChild(name: string, child: Node) {
        this.node.setChild(name, child);
    }

    addChild(name: string, child: Node) {
        this.node.addChild(name, child);
    }

    setAttribute(name: string | symbol, value: any) {
        this.node.setAttribute(name, value);
    }

    getAttribute(name: string | symbol): any {
        return this.node.getAttribute(name);
    }

    get(): ExternalNode | undefined {
        return undefined;
    }

    getAttributes(): { [p: string]: any } {
        return {};
    }

    getId(): string {
        return "TODO";
    }

    getIssues(): Issue[] | undefined {
        return undefined;
    }

    getPosition(): Position | undefined {
        return this.node.position;
    }

    getRole(): string | undefined {
        return undefined;
    }

    isDeclaration(): boolean {
        return false;
    }

    isExpression(): boolean {
        return false;
    }

    isStatement(): boolean {
        return false;
    }
}

export abstract class TraceNode extends Node {

    abstract parent?: TraceNode;

    protected constructor(public wrappedNode: ExternalNode) {
        super();
    }

    getType(): string {
        if (this.nodeDefinition.package) {
            return this.nodeDefinition.package + "." + this.nodeDefinition.name!;
        } else {
            return this.nodeDefinition.name!;
        }
    }

    getSimpleType(): string {
        return this.nodeDefinition.name!;
    }

    getRole(): string | undefined {
        return this.wrappedNode.getRole();
    }

    getPosition(): Position | undefined {
        return this.wrappedNode.getPosition();
    }

    get position(): Position | undefined {
        return this.getPosition();
    }

    get nodeDefinition(): NodeDefinition {
        return this.wrappedNode.nodeDefinition;
    }

    getAttributes(): { [name: string]: any } {
        return this.wrappedNode.getAttributes();
    }

    doGetAttribute(attrName: string): any {
        return this.wrappedNode.getAttribute(attrName);
    }

    getPathFromRoot(): (string | number)[] {
        if (this.parent) {
            const role = this.getRole()!;
            const path = this.parent.getPathFromRoot();
            const ft = this.parent.containment(role)!;
            path.push(ft.name.toString());
            if (ft.multiple) {
                const children = this.parent.getChildren(ft.name);
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    if (child instanceof TraceNode && child.equals(this)) {
                        path.push(index);
                    }
                }
            }
            return path;
        } else {
            return [];
        }
    }

    equals(node: TraceNode) {
        return node === this || node.wrappedNode.equals(this.wrappedNode);
    }

    isDeclaration(): boolean {
        return this.wrappedNode.isDeclaration();
    }

    isExpression(): boolean {
        return this.wrappedNode.isExpression();
    }

    isStatement(): boolean {
        return this.wrappedNode.isStatement();
    }
}
