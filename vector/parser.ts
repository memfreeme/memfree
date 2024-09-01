import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";

export async function getFileContent(file: File) {
  switch (file.type) {
    case "text/markdown": {
      if (file.name.endsWith(".md")) {
        const arrayBuffer = await file.arrayBuffer();
        return {
          type: "md",
          url: `local-md-${file.name}`,
          markdown: new TextDecoder("utf-8").decode(arrayBuffer),
        };
      } else {
        throw new Error("Unsupported file type");
      }
    }
    case "application/pdf": {
      const loader = new PDFLoader(file, {
        splitPages: false,
      });
      const docs = await loader.load();
      return {
        type: "pdf",
        url: `local-pdf-${file.name}`,
        markdown: docs[0].pageContent,
      };
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const loader = new DocxLoader(file);
      const docs = await loader.load();
      return {
        type: "docx",
        url: `local-docx-${file.name}`,
        markdown: docs[0].pageContent,
      };
    }
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      const loader = new PPTXLoader(file);
      const docs = await loader.load();
      return {
        type: "pptx",
        url: `local-pptx-${file.name}`,
        markdown: docs[0].pageContent,
      };
    }
    default:
      throw new Error("Unsupported file type");
  }
}
