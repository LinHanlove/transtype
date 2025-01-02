import parse from "json5/lib/parse";
import prettier from "prettier/standalone";
import typescriptParser from "prettier/parser-typescript";

// 缩进
const space = "  ";

type KV = Record<string | number | symbol, unknown>;

type Item = {
  type: string;
  key: string;
  required: string;
  description: string;
}

const TYPE = [
  "String",
  "string",
  "Number",
  "number",
  "Int",
  "int",
  "Integer",
  "integer",
  "Boolean",
  "boolean",
  "List",
  "list",
  "Object",
  "object",
  "Array",
  "array",
];

export default function getFsType(originData: Item[]) {
  try {
    // 初始化
    const typeArray: string[] = [`interface ResponseData {`];

    /**
     * @function 遍历节点处理数据
     */
    function traverseNode(
      node: any,  
      level = 0
    ) {
      const indent = space.repeat(level);

      console.log('原数据--->', node);
      
      for (let currentNode of node) {
        console.log('当前节点--->', currentNode,currentNode.length);
        // 表头不处理
        if (TYPE.includes(currentNode.type)) {
          typeArray.push(format(indent,currentNode));
          continue;
        }

        // 处理数据项为数组的情况
        for (const key in currentNode) {
          const childNode = currentNode[key];
          if(isArray(childNode)) {
            typeArray.push(`${indent}${key}: {`);
            childNode.forEach((item: any, index: number) => {
               typeArray.push(format(indent,item));
            });
            typeArray.push(`${indent}}[];`);  
          } 
        }
      }

      typeArray.push('}');

      // 换行
      const typeString = typeArray.join("\n");
      
      console.log(
        "类型转换-->",
        prettier.format(typeString, {
          parser: "typescript",
          plugins: [typescriptParser],
        })
      );
      return prettier.format(typeString, {
        parser: "typescript",
        plugins: [typescriptParser],
      }) as string;
    }
    // 遍历节点处理数据
    return traverseNode(originData);
  } catch (error) {
    console.log("类型转换失败-->", error);
  }
}

/**
 * 返回格式
 */
const format = (indent: string,node:Item) => {
  return `${indent}${node.key}${node.required === 'M' ?'':'?'}:${TYPE_MAP(node.type)} // ${node.description};`;
};

/**
 * 判断是否为对象
 * @param node 节点
 * @returns
 */
function isObject(node: unknown): node is KV {
  return "[object Object]" === Object.prototype.toString.call(node);
}

/**
 * 判断是否为数组
 * @param node 节点
 * @returns
 */
function isArray(node: unknown): node is unknown[] {
  return "[object Array]" === Object.prototype.toString.call(node);
}

function TYPE_MAP(type: string): string {
  switch (type) {
    case "String":
    case "string":
      return "string";
    case "Number":
    case "number":
    case "Int":
    case "int":
    case "Integer":
    case "integer":
      return "number";
    case "Boolean":
    case "boolean":
      return "boolean";
    case "List":
    case "list":
    case "Array":
    case "array":
      return "[]";
    default:
      return type;
  }
}
