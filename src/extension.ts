import { window, commands, env, Range, type ExtensionContext } from "vscode";
import getType from "./getType";
import getFsType from "./getFsType";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("fs-type", async () => {
      try {
        const input = await window.showInputBox({
          title: "fs-type",
          placeHolder: "🌿 json数据或格式化后的markdown表格数据导出 typescript 类型",
        });
        if (input) {
          const data = JSON.parse(input);
          const output = data.TableMarkdown ? getFsType(data.TableMarkdown) : getType(input);
          console.log(output);
          insertText(output);
          await env.clipboard.writeText(output);
          window.showInformationMessage("类型生成成功, 已复制到剪贴板.");
        }
      } catch (error) {
        window.showErrorMessage(error as string);
      }
    })
  );
}

/**
 * 插入文字到编辑器
 * @param text 文字
 */
function insertText(text: string): void {
  const editor = window.activeTextEditor;
  if (editor) {
    const { selections } = editor;
    editor.edit((editBuilder) => {
      selections.forEach((selection) => {
        const { start, end } = selection;
        const range = new Range(start, end);
        editBuilder.replace(range, text);
      });
    });
  }
}

export function deactivate() {}
