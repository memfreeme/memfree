import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface EditorProps {
    defaultValue?: string;
    onChange?: (value: string | undefined) => void;
}

const MonacoEditor: React.FC<EditorProps> = ({ defaultValue = 'code', onChange }) => {
    const handleEditorChange = (value: string | undefined) => {
        if (onChange) {
            onChange(value);
        }
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            jsxFactory: 'React.createElement',
            reactNamespace: 'React',
            allowNonTsExtensions: true,
            allowJs: true,
            noResolve: true,
            noEmit: true,
            target: monaco.languages.typescript.ScriptTarget.Latest,
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false,
            noSuggestionDiagnostics: true,
        });

        const uri = monaco.Uri.parse('file:///main.tsx');
        let model = monaco.editor.getModel(uri);

        if (!model) {
            model = monaco.editor.createModel(defaultValue, 'typescript', uri);
        } else {
            model.setValue(defaultValue);
        }

        editor.setModel(model);
    };

    return (
        <div className="w-full h-[100vh] border border-gray-300 rounded-lg overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage="typescript"
                defaultValue={defaultValue}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    quickSuggestions: true,
                    contextmenu: true,
                    copyWithSyntaxHighlighting: true,
                    ariaLabel: 'code editor',
                    readOnly: false,
                }}
                className="w-full h-full"
            />
        </div>
    );
};

export default MonacoEditor;
