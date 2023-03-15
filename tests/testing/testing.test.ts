import {expect} from "chai";
import {assertASTsAreEqual} from "../../src/testing/testing";
import {NodeName, Children, ASTNode, Point, Position, PossiblyNamed, Property} from "../../src";

describe('AssertASTsAreEqual', function() {
    it("the very same node instance compared with itself must pass", function () {
        const simpleNode1 : ASTNode = new SimpleNode("node");
        assertASTsAreEqual(simpleNode1, simpleNode1);
    });
    it("two different node instances of the same type and with the same values must pass", function () {
        const simpleNode1 : ASTNode = new SimpleNode("node");
        const simpleNode2 : ASTNode = new SimpleNode("node");
        assertASTsAreEqual(simpleNode1, simpleNode2)
    });
    it("nodes with different positions must pass when considerPosition == false", function () {
        const simpleNode1 : ASTNode = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(1, 0));
        const simpleNode2 : ASTNode = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(2, 0));
        assertASTsAreEqual(simpleNode1, simpleNode2)
    });
    it("nodes with different positions must NOT pass when considerPosition == true", function () {
        const simpleNode1 : ASTNode = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(1, 0));
        const simpleNode2 : ASTNode = new SimpleNode("node");
        simpleNode2.position = Position.ofPoint(new Point(2, 0));
        expect(() =>
            assertASTsAreEqual(simpleNode1, simpleNode2, "<root>", true)
        ).to.throw("position");
    });
    it("nodes with equal positions must pass when considerPosition == true", function () {
        const simpleNode1 : ASTNode = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(1, 0));
        const simpleNode2 : ASTNode = new SimpleNode("node");
        simpleNode2.position = Position.ofPoint(new Point(1, 0));
        assertASTsAreEqual(simpleNode1, simpleNode2, "<root>", true)
    });
    it("two different node instances of the same type and with different values must NOT pass", function () {
        const simpleNode1 : ASTNode = new SimpleNode("node");
        const simpleNode2 : ASTNode = new SimpleNode("different node");
        expect(() =>
            assertASTsAreEqual(simpleNode1, simpleNode2)
        ).to.throw("expected 'different node' to equal 'node'");
    });
    it("two different node instances of two different types, but with same values must NOT pass", function () {
        const node1 : ASTNode = new SimpleNode("node");
        const node2 : ASTNode = new AnotherSimpleNode("node");
        expect(() =>
            assertASTsAreEqual(node1, node2)
        ).to.throw("nodes are not of the same type");
    });
    it("two different node instances of two different types, and with different values must NOT pass", function () {
        const node1 : ASTNode = new SimpleNode("node");
        const node2 : ASTNode = new AnotherSimpleNode("different node");
        expect(() =>
            assertASTsAreEqual(node1, node2)
        ).to.throw("nodes are not of the same type");
    });
    it("two equal trees of height = 3", function () {
        const tree1 = new SimpleNode("A", [
            new SimpleNode("B"), new SimpleNode("C", [
                new SimpleNode("D")
            ])
        ]);
        const tree2 = new SimpleNode("A", [
            new SimpleNode("B"), new SimpleNode("C", [
                new SimpleNode("D")
            ])
        ]);
        assertASTsAreEqual(tree1, tree2)
    });
    it("two trees of height = 3 with different node on the 3rd level", function () {
        const tree1 =
            new SimpleNode("A", [
                new SimpleNode("B"),
                new SimpleNode("C", [
                    new SimpleNode("D1")
                ])
            ]);
        const tree2 =
            new SimpleNode("A", [
                new SimpleNode("B"),
                new SimpleNode("C", [
                    new SimpleNode("D2")
                ])
            ]);
        expect(() =>
            assertASTsAreEqual(tree1, tree2)
        ).to.throw();
    });
    it("two different nodes with same property names but one is a Node and the other is a string, then must NOT pass", function () {
        const treeWithLegitSubTree = new SimpleNode("A", []);
        const treeWithStringSubTree = new NodeWithStringSubTree("A", "sub-tree");
        expect(() =>
            assertASTsAreEqual(treeWithLegitSubTree, treeWithStringSubTree)
        ).to.throw();
    });
});

@NodeName("", "SimpleNode")
class SimpleNode extends ASTNode implements PossiblyNamed {
    @Property() public name?: string;
    @Children() public subTree: ASTNode[];
    constructor(name?: string, subTree: ASTNode[] = []) {
        super();
        this.name = name;
        this.subTree = subTree;
    }
}

@NodeName("", "AnotherSimpleNode")
class AnotherSimpleNode extends ASTNode implements PossiblyNamed {
    @Property() public name?: string;
    @Children() public subTree: ASTNode[];
    constructor(name?: string, subTree: ASTNode[] = []) {
        super();
        this.name = name;
        this.subTree = subTree;
    }
}

@NodeName("", "NodeWithStringSubTree")
class NodeWithStringSubTree extends ASTNode implements PossiblyNamed {
    @Property() public name?: string;
    @Children() public subTree?: string;
    constructor(name?: string, subTree?: string) {
        super();
        this.name = name;
        this.subTree = subTree;
    }
}
