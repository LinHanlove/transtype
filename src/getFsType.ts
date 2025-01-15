import parse from 'json5/lib/parse';
import prettier from 'prettier/standalone';
import typescriptParser from 'prettier/parser-typescript';

/**
 * @function 获取类型
 * @param originData 原始数据
 * @returns 类型
 */
export default function getFsType(originData: any[]): string {
  try {
    // 初始化
    const typeArray: string[] = [`interface ResponseData {`];

    /**
     * @function 遍历节点处理数据
     */
    function traverseNode(node: any, level = 0): void {
      const indent = '  '.repeat(level);
      console.log('当前', node);

      if (isObject(node)) {
        for (const key in node) {
          const childNode = node[key];
          console.log('子节点', childNode);

          if (isArray(childNode)) {
            // 如果数组中包含对象，则需要递归处理
            typeArray.push(`${indent}${key}: {`);
            childNode.forEach((item: any) => {
              if (!item.id) {
                traverseNode(item, level + 1);
              }
            });
            typeArray.push(`${indent}}${childNode.length && childNode[0].id === 'List' ? '[]' : ''}`);
          } else {
            typeArray.push(format(indent, node));
            break;
          }
        }
      } else if (isArray(node)) {
        node.forEach((item: any) => {
          traverseNode(item, level);
        });
      }
    }

    // 遍历节点处理数据
    traverseNode(originData);

    typeArray.push('}');

    // 换行并格式化
    const typeString = typeArray.join('\n');
    return prettier.format(typeString, {
      parser: 'typescript',
      plugins: [typescriptParser],
    }) as string;
  } catch (error) {
    console.log('类型转换失败-->', error);
    return '';
  }
}

// 格式化字符串
function format(indent: string, node: any): string {
  const { key, type, required, description } = node;
  return `${indent}${key}${isRequired(required) ? '' : '?'}: ${TYPE_MAP(type)}; // ${description}`;
}

// 判断是否为对象
function isObject(item: any): item is { [key: string]: any } {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

// 判断是否为数组
function isArray(item: any): item is any[] {
  return Array.isArray(item);
}

/**
 * @function类型转换
 * @param type 类型
 * @returns 转换后的类型
 */
function TYPE_MAP(type: string): string {
  switch (type) {
    case 'String':
    case 'string':
      return 'string';
    case 'Number':
    case 'number':
    case 'Int':
    case 'int':
    case 'Integer':
    case 'integer':
      return 'number';
    case 'Boolean':
    case 'boolean':
      return 'boolean';
    case 'List':
    case 'list':
    case 'Array':
    case 'array':
      return '[]';
    default:
      return type;
  }
}

/**
 * @function 是否必填
 * @param required 必填
 * @returns 是否必填
 */
function isRequired(required: string): boolean {
  return required === 'M' || required === '是' || required === '必填';
}
