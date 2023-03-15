import {ASTNode} from "../model/model";

declare module '../model/model' {
    export interface ASTNode {
        /**
         * A generator that walks over the whole AST starting from this node, depth-first.
         */
        walk(): Generator<ASTNode>;
        /**
         * A generator that walks over the whole AST starting from the children of this node.
         * @param walker a function that generates a sequence of nodes. By default, this is the depth-first
         * "walk" function.
         * For post-order traversal, use "walkLeavesFirst".
         */
        walkDescendants(walker?: typeof walk): Generator<ASTNode>;

        /**
         * A generator that walks over the direct children of this node.
         */
        walkChildren(): Generator<ASTNode>;
    }
}

/**
 * A generator that walks the whole AST starting from the provided node, depth-first.
 * @param node the starting node.
 */
export function* walk(node: ASTNode): Generator<ASTNode> {
    const stack = [node];
    while(stack.length > 0) {
        const currentNode = stack.pop();
        if (currentNode) {
            stack.push(...(currentNode.children?.reverse() || []));
            yield currentNode;
        }
    }
}

ASTNode.prototype.walk = function() {
    return walk(this);
};

/**
 * A generator that walks the whole AST starting from the children of the given node.
 * @param node the starting node (excluded from the walk).
 * @param walker a function that generates a sequence of nodes. By default this is the depth-first "walk" function.
 * For post-order traversal, use "walkLeavesFirst".
 */
export function* walkDescendants(node: ASTNode, walker: typeof walk = walk): Generator<ASTNode> {
    for(const n of walker(node)) {
        if(n != node) {
            yield n;
        }
    }
}

ASTNode.prototype.walkDescendants = function(walker: typeof walk = walk) {
    return walkDescendants(this, walker)
};


/**
 * @return all direct children of this node.
 */
export function* walkChildren(node: ASTNode): Generator<ASTNode> {
    for (const property of node.properties) {
        const value = property.value;
        if (value instanceof ASTNode) {
            yield value;
        }
        if(Array.isArray(value)) {
            for (let i = 0; i < value.length; i++){
                if(value[i] instanceof ASTNode) {
                    yield value[i];
                }
            }
        }
    }
}

ASTNode.prototype.walkChildren = function() {
    return walkDescendants(this);
};
