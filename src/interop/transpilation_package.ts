import * as Ecore from "ecore/dist/ecore";
import {
    getEPackage,
    THE_AST_EPACKAGE,
    THE_ISSUE_ECLASS,
    THE_NODE_ECLASS,
    THE_REFERENCE_BY_NAME_ECLASS,
    THE_RESULT_ECLASS
} from "./ecore";

export const KOLASU_TRANSPILATION_URI_V1 = "https://strumenta.com/kolasu/transpilation/v1";
export const TRANSPILATION_RESOURCE = Ecore.ResourceSet.create().create({ uri: KOLASU_TRANSPILATION_URI_V1 });
export const TRANSPILATION_EPACKAGE = getEPackage("StrumentaLanguageSupportTranspilation", { nsURI: KOLASU_TRANSPILATION_URI_V1 });
TRANSPILATION_RESOURCE.get("contents").add(TRANSPILATION_EPACKAGE);

export const TRANSPILATION_TRACE_ECLASS = Ecore.EClass.create({
    name: "TranspilationTrace",
    abstract: false
});
TRANSPILATION_EPACKAGE.get('eClassifiers').add(TRANSPILATION_TRACE_ECLASS);

TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "originalCode",
    eType: Ecore.EString,
    upperBound: 1
}));
TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "generatedCode",
    eType: Ecore.EString,
    upperBound: 1
}));
TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "sourceAST",
    containment: true,
    eType: THE_NODE_ECLASS
}));
TRANSPILATION_TRACE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "targetAST",
    containment: true,
    eType: THE_NODE_ECLASS
}));
