import { window, commands, env, Range, type ExtensionContext } from 'vscode';
import getType from './getType';
import getFsType from './getFsType';

export function activate(context: ExtensionContext) {
  // 注册命令
  const disposable = commands.registerCommand('transtype', handleTranstype);
  context.subscriptions.push(disposable);
}

/**
 * 处理类型转换命令
 */
async function handleTranstype() {
  try {
    const input = await window.showInputBox({
      title: 'TypeScript类型转换',
      placeHolder: '请输入JSON数据或格式化后的Markdown表格数据',
      prompt: '将自动转换为TypeScript类型定义',
    });

    if (!input) {
      return;
    }

    const data = JSON.parse(input);
    const output = data.TableMarkdown ? getFsType(data.TableMarkdown) : getType(input);
    console.log('output', output);

    // 插入到编辑器并复制到剪贴板
    await Promise.all([insertText(output), env.clipboard.writeText(output)]);

    window.showInformationMessage('✨ 类型生成成功,已复制到剪贴板');
  } catch (error) {
    window.showErrorMessage(`转换失败: ${error}`);
  }
}

/**
 * 在编辑器中插入文本
 * @param text 要插入的文本
 */
async function insertText(text: string): Promise<void> {
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }

  await editor.edit((editBuilder) => {
    editor.selections.forEach((selection) => {
      editBuilder.replace(selection, text);
    });
  });
}

export function deactivate() {}
