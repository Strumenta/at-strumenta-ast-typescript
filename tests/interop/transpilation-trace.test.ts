import {expect} from "chai";
import * as fs from "fs";
import {findByPosition, Point, pos, Position} from "../../src";
import { loadEObject, loadEPackages } from "../../src/interop/ecore"
import { SourceNode, TargetNode, TranspilationTraceLoader } from "../../src/interop/strumenta-playground"
import {THE_AST_EPACKAGE} from "../../src/interop/kolasu-v2-metamodel";
import * as Ecore from "ecore/dist/ecore";
import {TRANSPILATION_EPACKAGE} from "../../src/interop/transpilation-package";
import {ensureEcoreContainsAllDataTypes} from "../../src/interop/ecore-patching";

ensureEcoreContainsAllDataTypes();

describe('Transpilation traces', function() {
    // This test verifies that the EReference class has been loaded correctly.
    // Under certain circumstances this was not the case
    it("Can instantiate EReference correctly", function () {
            const A_ECLASS = Ecore.EClass.create({
                    name: "MyClass",
                    abstract: true,
            });
            const ef = Ecore.EReference.create({
                    name: "sourceAST",
                    containment: true,
                    eType: A_ECLASS
            });
            expect(ef.get("eType").get("name")).to.eql("MyClass")
    })
        it("Can load Java metamodel correctly", function () {
                const resourceSet = Ecore.ResourceSet.create();
                const resource = resourceSet.create({uri: 'file:/tests/data/playground/java-metamodels.json'})
                const data = JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString());
                resource.parse(data);
                const jcompilationunit = resource.eContents()[0].eContents()[30];
                expect(jcompilationunit.get("name")).to.eql( "JCompilationUnit");
                const declarations = jcompilationunit.eContents()[0];
                expect(declarations.get("name")).to.eql( "declarations");
                expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");
        })
        it("Can load eType for all references in Java metamodel",
            function () {
                    this.timeout(0);
                    const resourceSet = Ecore.ResourceSet.create();
                    Ecore.EPackage.Registry.register(THE_AST_EPACKAGE)
                    Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE)
                    const rpgMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/rpg-metamodels.json'})
                    const javaPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString()),
                        rpgMetamodelsResource);
                    expect(rpgMetamodelsResource.eContents().length).to.eql(1);
                    const javaast = rpgMetamodelsResource.eContents()[0];
                    expect(javaast.eClass.get("name")).to.eql("EPackage");
                    expect(javaast.eContents().length).to.eql(31);
                    const jCompilationUnit = javaast.eContents()[30];
                    expect(jCompilationUnit.eClass.get("name")).to.eql("EClass");
                    expect(jCompilationUnit.get("name")).to.eql("JCompilationUnit");
                    expect(jCompilationUnit.eContents().length).to.eql(1);
                    const declarations = jCompilationUnit.eContents()[0];
                    expect(declarations.eClass.get("name")).to.eql("EReference");
                    expect(declarations.get("name")).to.eql("declarations");
                    expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");
            }
        );
    it("Can load transpilation trace produced by Kolasu as EObject",
        function () {
            this.timeout(0);

            const resourceSet = Ecore.ResourceSet.create();
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE);
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const rpgMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/rpg-metamodels.json'})
            const rpgPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/rpg-metamodels.json").toString()),
                 rpgMetamodelsResource);
            const javaMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/java-metamodels.json'})
            const javaPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString()),
                javaMetamodelsResource);

            const resource = resourceSet.create({ uri: 'rpgtojava-transpilation-example.json' });
            const text = fs.readFileSync('tests/data/playground/rpgtojava-transpilation-example.json', 'utf8')

            const javaast = javaMetamodelsResource.eContents()[0];
            expect(javaast.eClass.get("name")).to.eql("EPackage");
            expect(javaast.eContents().length).to.eql(31);
            const jCompilationUnit = javaast.eContents()[30];
            expect(jCompilationUnit.eClass.get("name")).to.eql("EClass");
            expect(jCompilationUnit.get("name")).to.eql("JCompilationUnit");
            expect(jCompilationUnit.eContents().length).to.eql(1);
            const declarations = jCompilationUnit.eContents()[0];
            expect(declarations.eClass.get("name")).to.eql("EReference");
            expect(declarations.get("name")).to.eql("declarations");
            expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");

            const example1 = loadEObject(text.toString(), resource);
            expect(example1.get("sourceResult").get("root").eClass.get("name")).to.equal("CompilationUnit");
        });
    it("Can load transpilation trace produced by Kolasu as TranspilationTrace instance",
        function () {
            this.timeout(0);
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE);
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const loader = new TranspilationTraceLoader({
                name: "rpg",
                uri: "file://tests/data/playground/rpg-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/rpg-metamodels.json").toString())
            }, {
                name: "java",
                uri: "file://tests/data/playground/java-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString())
            });
            const example = fs.readFileSync("tests/data/playground/rpgtojava-transpilation-example.json").toString();
            const trace = loader.loadTranspilationTrace(example);

            const rootSourceNode = trace.rootSourceNode;
            expect(rootSourceNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(rootSourceNode.getSimpleType()).to.eql("CompilationUnit");
            expect(rootSourceNode.getPosition()).to.eql(pos(1, 0,32, 30));
            expect(rootSourceNode.getDestinationNode().getType()).to.eql("com.strumenta.javaast.JCompilationUnit");
            expect(rootSourceNode.getDestinationNode().getDestination()).to.eql(new Position(new Point(1, 0), new Point(29, 0)));
            expect(rootSourceNode.getChildren().length).to.eql(11);
            expect(rootSourceNode.getChildren("mainStatements").length).to.eql(5);
            expect(rootSourceNode.getRole()).to.eql("root");
            expect(rootSourceNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");
            let foundSourceNode = findByPosition(rootSourceNode, pos(1, 0,32, 30)) as SourceNode;
            expect(foundSourceNode.eo == rootSourceNode.eo).to.be.true;
            const descNode = rootSourceNode.children[3].children[1] as SourceNode;
            foundSourceNode = findByPosition(descNode, descNode.position) as SourceNode;
            expect(foundSourceNode.eo == descNode.eo).to.be.true;

            const rootTargetNode = trace.rootTargetNode;
            expect(rootTargetNode.getType()).to.eql("com.strumenta.javaast.JCompilationUnit");
            expect(rootTargetNode.getSimpleType()).to.eql("JCompilationUnit");
            expect(rootTargetNode.getDestination()).to.eql(pos(1, 0, 29, 0));
            expect(rootTargetNode.getSourceNode().getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(rootTargetNode.getSourceNode().getPosition()).to.eql(new Position(new Point(1, 0), new Point(32, 30)));
            expect(rootTargetNode.getChildren().length).to.eql(1);
            expect(rootTargetNode.getChildren("declarations").length).to.eql(1);
            expect(rootTargetNode.getChildren("unexisting").length).to.eql(0);
            expect(rootTargetNode.getRole()).to.eql("root");
            expect(rootTargetNode.getChildren("declarations")[0].getRole()).to.eql("declarations");
            let foundTargetNode = findByPosition(rootTargetNode, pos(1, 0, 29, 0)) as TargetNode;
            expect(foundTargetNode.parent.eo == rootTargetNode.eo).to.be.true;
            const descTargetNode = rootTargetNode.children[0].children[5] as TargetNode;
            foundTargetNode = findByPosition(descTargetNode, descTargetNode.position) as TargetNode;
            expect(foundTargetNode.eo == descTargetNode.eo).to.be.true;
        });
/*
    it("Can load transpilation trace produced by Pylasu as TranspilationTrace instance",
        function () {
            this.timeout(0);
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE);
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const sasMetamodel =
                JSON.parse(fs.readFileSync("tests/data/playground/pylasu-examples/sas-metamodel.json").toString());
            const pyMetamodel =
                JSON.parse(fs.readFileSync("tests/data/playground/pylasu-examples/pyspark-metamodel.json").toString());
            const loader = new TranspilationTraceLoader({
                name: "sas",
                uri: "file://tests/data/playground/pylasu-examples/sas-metamodel.json",
                metamodel: sasMetamodel
            }, {
                name: "python",
                uri: "file://tests/data/playground/pylasu-examples/pyspark-metamodel.json",
                metamodel: pyMetamodel
            });
            const example = fs.readFileSync("tests/data/playground/pylasu-examples/array_test_0.json").toString();
            const trace = loader.loadTranspilationTrace(example);

            expect(trace.rootSourceNode.getType()).to.eql("com.strumenta.sas.Program");
            expect(trace.rootSourceNode.getSimpleType()).to.eql("Program");
            expect(trace.rootSourceNode.getPosition()).to.eql(new Position(new Point(1, 0), new Point(32, 30)));
            expect(trace.rootSourceNode.getDestinationNode().getType()).to.eql("com.strumenta.javaast.JCompilationUnit");
            expect(trace.rootSourceNode.getDestinationNode().getDestination()).to.eql(new Position(new Point(1, 0), new Point(29, 0)));
            expect(trace.rootSourceNode.getChildren().length).to.eql(11);
            expect(trace.rootSourceNode.getChildren("mainStatements").length).to.eql(5);
            expect(trace.rootSourceNode.getRole()).to.eql("sourceAST");
            expect(trace.rootSourceNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");

            expect(trace.rootTargetNode.getType()).to.eql("com.strumenta.javaast.JCompilationUnit");
            expect(trace.rootTargetNode.getSimpleType()).to.eql("JCompilationUnit");
            expect(trace.rootTargetNode.getDestination()).to.eql(new Position(new Point(1, 0), new Point(29, 0)));
            expect(trace.rootTargetNode.getSourceNode().getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(trace.rootTargetNode.getSourceNode().getPosition()).to.eql(new Position(new Point(1, 0), new Point(32, 30)));
            expect(trace.rootTargetNode.getChildren().length).to.eql(1);
            expect(trace.rootTargetNode.getChildren("declarations").length).to.eql(1);
            expect(trace.rootTargetNode.getChildren("unexisting").length).to.eql(0);
            expect(trace.rootTargetNode.getRole()).to.eql("targetAST");
            expect(trace.rootTargetNode.getChildren("declarations")[0].getRole()).to.eql("declarations");
        });*/
});
