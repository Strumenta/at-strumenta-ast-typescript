import {expect} from "chai";

import {Issue, ASTNode, NODE_TYPES, Point, Position} from "../../src";
import {
    fromEObject,
    generateASTClasses,
    registerECoreModel,
    SYMBOL_CLASS_DEFINITION,
    SYMBOL_NODE_NAME,
    toEObject, loadEPackages, loadEObject, generateASTModel, Result
} from "../../src/interop/ecore";
import {Fibo, SomeNode, SomeNodeInPackage} from "../nodes";
import * as Ecore from "ecore/dist/ecore";
import * as fs from "fs";
import {KOLASU_URI_V1} from "../../src/interop/kolasu-v1-metamodel";
import {THE_POSITION_ECLASS, THE_AST_RESOURCE} from "../../src/interop/kolasu-v1-metamodel";

describe('Metamodel', function() {
    it("Base metamodel", function () {
        expect(THE_POSITION_ECLASS.eURI()).to.equal(`${KOLASU_URI_V1}#//Position`);
    });
    it("default package",
        function () {
            const ePackage = registerECoreModel("");
            expect(ePackage).not.to.be.undefined;
            const classes = ePackage.get("eClassifiers");
            expect(classes.size() > 0).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "SomeNode");
            expect(eClass).not.to.be.undefined;
        });
    it("named package",
        function () {
            const ePackage = registerECoreModel("some.package");
            expect(ePackage).not.to.be.undefined;
            expect(ePackage.get("eClassifiers").size() >= 1).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "SomeNodeInPackage");
            expect(eClass).not.to.be.undefined;
            expect(eClass.get('eStructuralFeatures').size()).to.equal(4);
            expect(eClass.get('eStructuralFeatures').at(0).get("name")).to.equal("a");
            expect(eClass.get('eStructuralFeatures').at(0).get("upperBound")).to.equal(1);
            expect(eClass.get('eStructuralFeatures').at(1).get("name")).to.equal("someNode");
            expect(eClass.get('eStructuralFeatures').at(1).get("upperBound")).to.equal(1);
            expect(eClass.get('eStructuralFeatures').at(2).get("name")).to.equal("multi");
            expect(eClass.get('eStructuralFeatures').at(2).get("upperBound")).to.equal(-1);
            expect(eClass.get('eStructuralFeatures').at(2).get("containment")).to.be.true;
            expect(eClass.get('eStructuralFeatures').at(3).get("name")).to.equal("selfRef");
            expect(eClass.get('eStructuralFeatures').at(3).get("containment")).to.be.true;
        });
    it("inheritance",
        function () {
            const ePackage = registerECoreModel("some.package");
            expect(ePackage).not.to.be.undefined;
            expect(ePackage.get("eClassifiers").size() >= 1).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "NodeSubclass");
            expect(eClass).not.to.be.undefined;
            expect(eClass.get('eSuperTypes').size()).to.equal(1);
            expect(eClass.get('eSuperTypes').at(0).get("name")).to.equal("SomeNodeInPackage");
            expect(eClass.get('eStructuralFeatures').size()).to.equal(2);
            expect(eClass.get('eStructuralFeatures').at(0).get("name")).to.equal("b");
            expect(eClass.get('eStructuralFeatures').at(1).get("name")).to.equal("anotherChild");
            expect(eClass.get('eAllStructuralFeatures').length).to.equal(9);
            expect(eClass.get('eAllStructuralFeatures')[0].get("name")).to.equal("position");
            expect(eClass.get('eAllStructuralFeatures')[1].get("name")).to.equal("destination");
            expect(eClass.get('eAllStructuralFeatures')[2].get("name")).to.equal("origin");
            expect(eClass.get('eAllStructuralFeatures')[3].get("name")).to.equal("a");
            expect(eClass.get('eAllStructuralFeatures')[4].get("name")).to.equal("someNode");
            expect(eClass.get('eAllStructuralFeatures')[5].get("name")).to.equal("multi");
            expect(eClass.get('eAllStructuralFeatures')[6].get("name")).to.equal("selfRef");
            expect(eClass.get('eAllStructuralFeatures')[7].get("name")).to.equal("b");
            expect(eClass.get('eAllStructuralFeatures')[8].get("name")).to.equal("anotherChild");
        });
});

describe('Model', function() {
    it("simple EObject creation",
        function () {
            let node = new SomeNodeInPackage("aaa");
            node.someNode = new SomeNode("A");
            const eObject = toEObject(node);
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("a")).to.equal("aaa");
            expect(eObject.get("someNode").get("a")).to.equal("A");
            expect(eObject.get("someNode").eContainer).to.equal(eObject);
            node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.a).to.equal("aaa");
            expect(node.someNode instanceof SomeNode).to.be.true;
            expect(node.someNode.a).to.equal("A");
        });
    it("lists",
        function () {
            let node = new SomeNodeInPackage();
            node.multi = [new SomeNode("A"), new SomeNode("B")];
            const eObject = toEObject(node);
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("multi").size()).to.equal(2);
            expect(eObject.get("multi").at(0).get("a")).to.equal("A");
            expect(eObject.get("multi").at(0).eContainer === eObject).to.be.true;
            expect(eObject.get("multi").at(1).get("a")).to.equal("B");
            expect(eObject.get("multi").at(1).eContainer === eObject).to.be.true;
            node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.multi.length).to.equal(2);
            expect(node.multi[0].a).to.equal("A");
            expect(node.multi[0].parent === node).to.be.true;
            expect(node.multi[1].a).to.equal("B");
            expect(node.multi[1].parent === node).to.be.true;
        });
    it("position",
        function () {
            let node = new SomeNodeInPackage("aaa", new Position(new Point(1, 2), new Point(3, 4)));
            const eObject = toEObject(node);
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("position")).not.to.be.undefined;
            node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.position).not.to.be.undefined;
            expect(node.position!.start.line).to.equal(1);
            expect(node.position!.start.column).to.equal(2);
            expect(node.position!.end.line).to.equal(3);
            expect(node.position!.end.column).to.equal(4);
        });
    it("enums",
        function () {
            let node = new SomeNode("A");
            node.fib = Fibo.D;
            const eObject = toEObject(node);
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("a")).to.equal("A");
            expect(eObject.get("fib")).to.equal(3);
            node = fromEObject(eObject) as SomeNode;
            expect(node instanceof SomeNode).to.be.true;
            expect(node.a).to.equal("A");
            expect(node.fib).to.equal(Fibo.D);
        });
});

describe("Import/export", function () {
    it("exporting base metamodel", function () {
        THE_AST_RESOURCE.save((data, e) => {
            expect(e).to.be.null;
            const string = JSON.stringify(data, null, 2);
            console.log(string);
        });
    });
    it("importing using API", function () {
        this.timeout(0);
        const resourceSet = Ecore.ResourceSet.create();
        const resource = resourceSet.create({ uri: 'file:data/sas.metamodel.json' });
        const mmBuffer = fs.readFileSync("tests/data/sas.metamodel.json");
        const ePackages = loadEPackages(JSON.parse(mmBuffer.toString()), resource);
        expect(ePackages.length).to.equal(5);
        const buffer = fs.readFileSync("tests/data/sas.example1.json");
        const example1 = loadEObject(buffer.toString(), resource);
        expect(example1.eClass.get("name")).to.equal("Result");
        const root = example1.get("root");
        expect(root.eClass.get("name")).to.equal("SourceFile");
        expect(root.get("statementsAndDeclarations").size()).to.equal(26);
        expect(() => fromEObject(example1)).to.throw;
        generateASTModel(ePackages);
        const result = fromEObject(example1) as Result;
        expect(result.issues.length).to.equal(258);
        const node = result.root as any;
        expect(node instanceof ASTNode).to.be.true;
        expect(node.statementsAndDeclarations.length).to.equal(26);
    });
    it("importing using raw Ecore.js",
        function () {
            const resourceSet = Ecore.ResourceSet.create();
            const resource = resourceSet.create({ uri: 'file:data/simplemm.json' });
            const buffer = fs.readFileSync("tests/data/simplemm.json");
            resource.load(buffer.toString(), (r, e) => {
                expect(r).not.to.be.null;
                expect(r).not.to.be.undefined;
                const ePackage = r.get("contents").at(0);
                if(!ePackage.get("nsURI")) {
                    ePackage.set("nsURI", "");
                }
                Ecore.EPackage.Registry.register(ePackage);
                const pkg = generateASTClasses(ePackage);
                expect(Object.keys(pkg.nodes).length).to.equal(5);
                expect(NODE_TYPES["SimpleMM"].nodes["CompilationUnit"]).not.to.be.undefined;

                expect(NODE_TYPES["SimpleMM"].nodes["CompilationUnit"][SYMBOL_CLASS_DEFINITION]).to.equal(
                    `@ASTNode("SimpleMM", "CompilationUnit")
export class CompilationUnit extends Node {
\t@Child()
\tstatements;
}`);
                let node = new NODE_TYPES["SimpleMM"].nodes["CompilationUnit"]() as any;
                expect(node instanceof ASTNode).to.be.true;
                expect(node.constructor[SYMBOL_NODE_NAME]).to.equal("CompilationUnit");
                node = new NODE_TYPES["SimpleMM"].nodes["Statement"]() as any;
                expect(node instanceof ASTNode).to.be.true;
                expect(node.constructor[SYMBOL_NODE_NAME]).to.equal("Statement");
                //Subclassing
                expect(NODE_TYPES["SimpleMM"].nodes["StringLiteral"][SYMBOL_CLASS_DEFINITION]).to.equal(
                    `@ASTNode("SimpleMM", "StringLiteral")
export class StringLiteral extends Expression {
\t@Property()
\tvalue;
}`);
                node = new NODE_TYPES["SimpleMM"].nodes["StringLiteral"]() as any;
                expect(node instanceof NODE_TYPES["SimpleMM"].nodes["Expression"]).to.be.true;
                expect(node instanceof NODE_TYPES["SimpleMM"].nodes["StringLiteral"]).to.be.true;
                expect(node instanceof NODE_TYPES["SimpleMM"].nodes["CompilationUnit"]).to.be.false;
                expect(node.constructor[SYMBOL_NODE_NAME]).to.equal("StringLiteral");

                expect(NODE_TYPES[""].nodes["CompilationUnit"]).to.be.undefined;

                const buffer = fs.readFileSync("tests/data/simplem.json");
                Ecore.JSON.parse(r, buffer.toString());
                const cu = r.get("contents").at(1);
                expect(cu).not.to.be.null;
                expect(cu).not.to.be.undefined;
                expect(cu.eClass?.get("name")).to.equal("CompilationUnit");
                expect(cu.get("position")).not.to.be.undefined;
                node = fromEObject(cu) as ASTNode & any;
                expect(node instanceof ASTNode).to.be.true;
                expect(node.statements.length).to.equal(2);
                expect(node.statements.filter(s => s instanceof ASTNode).length).to.equal(2);
                expect(node.statements[1].visibility).to.equal(1);
                expect(node.position).not.to.be.undefined;
                expect(node.position.start).not.to.be.undefined;
                expect(node.position.start.line).to.equal(1);
                expect(node.position.start.column).to.equal(0);
                expect(node.position.end).not.to.be.undefined;
                expect(node.position.end.line).to.equal(1);
                expect(node.position.end.column).to.equal(1);
            });
        });
    it("Result export/import roundtrip", function () {
        const result = {
            root: new SomeNodeInPackage("root"),
            issues: [Issue.semantic("Something's wrong")]
        };
        const eObject = toEObject(result);
        expect(eObject.get("issues").size()).to.equal(1);
        expect(eObject.get("root").eClass.get("name")).to.equal("SomeNodeInPackage");
        const object = fromEObject(eObject) as Result;
        expect(object.issues.length).to.equal(1);
        expect(object.root instanceof SomeNodeInPackage).to.be.true;
    });
});
