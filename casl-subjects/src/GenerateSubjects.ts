import path from "path";
import {
  Project,
  ClassDeclaration,
  PropertyDeclaration,
  type OptionalKind,
  Type,
  PropertyDeclarationStructure,
} from "ts-morph";

class ClassIndex extends Map<string, ClassDeclaration> {}

const ENTITY_SUFFIX = "Entity";
const DTO_SUFFIX = "DTO";

const ARRAY_WRAPPER_TYPE = new Set(["Array", "Collection"]);

const WRAPPER_TYPES = new Set([
  ...ARRAY_WRAPPER_TYPE,
  "Ref",
  "Reference",
  "IdentifiedReference",
  "Rel",
]);

function getUnionMembers(type: Type): Set<string> {
  const members = type.getUnionTypes();
  const parts = members.length > 0 ? members : [type];

  return new Set(parts.map((t) => t.getText()));
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

function intersectProps(
  entityProps: NormalizedProperty[],
  dtoProps: NormalizedProperty[],
): OptionalKind<PropertyDeclarationStructure>[] {
  const dtoPropNameToProp = new Map(dtoProps.map((p) => [p.name, p]));

  const intersected = entityProps
    .map((p) => {
      const dto = dtoPropNameToProp.get(p.name);
      if (!dto) {
        console.log("No prop named: ", p.name);
        return undefined;
      }

      let equal = p.type === dto.type;
      let propToUse = p;

      // Check if the only difference is whether undefined is included.
      // If so, consider them equal.
      if (!equal) {
        const entityUnionMembers = getUnionMembers(p.type);
        const dtoUnionMembers = getUnionMembers(dto.type);
        entityUnionMembers.delete("undefined");
        // If it's the dto type that includes the undefined, we want to use it.
        if (dtoUnionMembers.delete("undefined")) {
          propToUse = dto;
        }

        equal = setsEqual(entityUnionMembers, dtoUnionMembers);

        if (!equal) {
          console.log("entity: ", entityUnionMembers);
          console.log("dto: ", dtoUnionMembers);
        }
      }
      if (!equal) {
        return undefined;
      }
      return propToUse;
    })
    .filter((x) => x !== undefined);

  return intersected.map((x) => {
    return {
      name: x.name,
      hasQuestionToken: x.hasQuestionToken,
      hasExclamationToken: !x.hasQuestionToken,
      type: x.convertToArray ? `(${x.type.getText()})[]` : x.type.getText(),
    };
  });
}

interface PropertyOrGetter {
  type: Type;
  name: string;
  hasQuestionToken: boolean;
}

function propertyOrGetterFromProperty(
  x: PropertyDeclaration,
): PropertyOrGetter {
  return {
    name: x.getName(),
    type: x.getType(),
    hasQuestionToken: x.hasQuestionToken(),
  };
}

interface NormalizedProperty {
  name: string;
  type: Type;
  hasQuestionToken: boolean;
  convertToArray: boolean;
}

function normalizeProperty(prop: PropertyOrGetter): NormalizedProperty {
  const type = prop.type;
  const originalProp: NormalizedProperty = {
    name: prop.name,
    type,
    hasQuestionToken: prop.hasQuestionToken,
    convertToArray: false,
  };

  const symbol = type.getSymbol();
  // No symbol means this is a raw type.
  if (!symbol) {
    return originalProp;
  }

  const isWrapper = WRAPPER_TYPES.has(symbol.getName());

  if (!isWrapper) {
    return originalProp;
  }

  const innerType = type.getTypeArguments()[0];
  if (!innerType) {
    throw new Error("Missing inner type for wrapper type.");
  }

  return {
    ...originalProp,
    type: innerType,
    convertToArray: ARRAY_WRAPPER_TYPE.has(symbol.getName()),
  };
}

function getClassIndex(project: Project, rootDir: string): ClassIndex {
  const classIndex = new ClassIndex();
  for (const sourceFile of project.getSourceFiles()) {
    // If this file isn't in the current project, ignore it.
    if (!sourceFile.getFilePath().startsWith(rootDir)) {
      continue;
    }
    for (const cls of sourceFile.getClasses()) {
      const clsName = cls.getName();
      if (clsName === undefined) {
        continue;
      }
      if (!clsName.endsWith(ENTITY_SUFFIX) && !clsName.endsWith(DTO_SUFFIX)) {
        continue;
      }
      classIndex.set(clsName, cls);
    }
  }
  return classIndex;
}

async function main(): Promise<void> {
  process.chdir("/app/");
  const backendProject = new Project({
    tsConfigFilePath: "grassroots-backend/tsconfig.json",
  });

  const sharedProject = new Project({
    tsConfigFilePath: "grassroots-shared/tsconfig.json",
  });

  const thisProject = new Project({
    tsConfigFilePath: "casl-subjects/tsconfig-generated.json",
  });

  const entityIndex = getClassIndex(
    backendProject,
    "/app/grassroots-backend/src",
  );
  const dtoIndex = getClassIndex(sharedProject, "/app/grassroots-shared/src");

  for (const [name, entityClass] of entityIndex) {
    // Look at each entity, and intersect with the DTO of the same name.
    const baseName = name.slice(0, -ENTITY_SUFFIX.length);
    const dtoClass = dtoIndex.get(baseName + DTO_SUFFIX);

    const outPath = path.join("casl-subjects", "gen", `${baseName}Subject.ts`);
    console.log("\n" + baseName);
    const outSourceFile = thisProject.createSourceFile(outPath, "", {
      overwrite: true,
    });
    outSourceFile.insertText(0, `// AUTO-GENERATED by GenerateSubjects.ts\n\n`);

    const entityProps: PropertyOrGetter[] = entityClass
      .getProperties()
      .map(propertyOrGetterFromProperty);

    const entityGetters: PropertyOrGetter[] = entityClass
      .getGetAccessors()
      .map((g) => ({
        name: g.getName(),
        type: g.getReturnType(),
        hasQuestionToken: false,
      }));

    const normalizedEntityProps = entityGetters
      .concat(entityProps)
      .map(normalizeProperty);

    console.log(
      "Entity props: ",
      normalizedEntityProps.map((x) => x.name),
    );
    const normalizedDtoProps = dtoClass
      ?.getProperties()
      .map((x) => normalizeProperty(propertyOrGetterFromProperty(x)));

    if (!normalizedDtoProps) {
      throw new Error(`Missing DTO for Entity ${name}`);
    }

    const props = intersectProps(normalizedEntityProps, normalizedDtoProps);

    const newClass = outSourceFile.addClass({
      name: `${baseName}Subject`,
      isExported: true,
      properties: props,
    });

    newClass.addProperty({
      name: "__caslSubjectType",
      isReadonly: true,
      type: `"${baseName}"`,
      initializer: `"${baseName}"`,
    });

    newClass.addProperty({
      isStatic: true,
      isReadonly: true,
      name: "__caslSubjectTypeStatic",
      type: `"${baseName}"`,
      initializer: `"${baseName}"`,
    });

    newClass.addConstructor({
      parameters: [
        {
          name: "init",
          type: `{ ${props.map((p) => `${p.name}${p.hasQuestionToken === true ? "?" : ""}: ${String(p.type)}`).join("; ")} }`,
        },
      ],
      statements: props.map((p) => `this.${p.name} = init.${p.name};`),
    });

    await outSourceFile.save();
  }

  await thisProject.save();
}

void main();
