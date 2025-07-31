import Cookies from "js-cookie";

export interface DocumentTemplate {
  title: string;
  content: string;
  htmlContent: string; // Add HTML formatted content
  documentId: string;
}

export interface ProcessedDocument {
  documentId: string;
  title: string;
  url: string;
}

export async function fetchDocumentTemplate(
  docId: string
): Promise<DocumentTemplate> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    // Use the provided docId parameter instead of hardcoded DOCUMENT_ID
    const response = await fetch(
      `https://docs.googleapis.com/v1/documents/${docId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.status === 403) {
      throw new Error("ACCESS_DENIED");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch document");
    }

    const document = await response.json();

    // Extract both plain text and formatted HTML content
    let content = "";
    let htmlContent = "";

    if (document.body && document.body.content) {
      content = extractTextFromDocument(document.body.content);
      htmlContent = extractFormattedHtmlFromDocument(document.body.content);
    }

    return {
      title: document.title || "Untitled Document",
      content: content,
      htmlContent: htmlContent,
      documentId: docId, // Use the provided docId
    };
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
}

function extractTextFromDocument(content: any[]): string {
  let text = "";

  for (const element of content) {
    if (element.paragraph && element.paragraph.elements) {
      for (const paragraphElement of element.paragraph.elements) {
        if (paragraphElement.textRun && paragraphElement.textRun.content) {
          text += paragraphElement.textRun.content;
        }
      }
    }
  }

  return text;
}

function extractFormattedHtmlFromDocument(content: any[]): string {
  let html = "";

  for (const element of content) {
    if (element.paragraph) {
      html += convertParagraphToHtml(element.paragraph);
    } else if (element.table) {
      html += convertTableToHtml(element.table);
    }
  }

  return html;
}

function convertParagraphToHtml(paragraph: any): string {
  let paragraphHtml = "";
  let hasContent = false;

  // Get paragraph style
  const style = paragraph.paragraphStyle || {};
  const alignment = style.alignment || "START";

  // Convert alignment
  let alignClass = "";
  switch (alignment) {
    case "CENTER":
      alignClass = "text-center";
      break;
    case "END":
      alignClass = "text-right";
      break;
    case "JUSTIFIED":
      alignClass = "text-justify";
      break;
    default:
      alignClass = "text-left";
  }

  if (paragraph.elements) {
    for (const element of paragraph.elements) {
      if (element.textRun) {
        hasContent = true;
        paragraphHtml += convertTextRunToHtml(element.textRun);
      }
    }
  }

  // Only create paragraph if there's content
  if (hasContent) {
    return `<p class="mb-4 ${alignClass}">${paragraphHtml}</p>`;
  }

  return "";
}

function convertTextRunToHtml(textRun: any): string {
  let text = textRun.content || "";
  let html = text;

  // Apply text formatting
  if (textRun.textStyle) {
    const style = textRun.textStyle;

    if (style.bold) {
      html = `<strong>${html}</strong>`;
    }

    if (style.italic) {
      html = `<em>${html}</em>`;
    }

    if (style.underline) {
      html = `<u>${html}</u>`;
    }

    // Handle font size
    if (style.fontSize && style.fontSize.magnitude) {
      const fontSize = Math.round(style.fontSize.magnitude);
      html = `<span style="font-size: ${fontSize}pt;">${html}</span>`;
    }

    // Handle text color
    if (style.foregroundColor && style.foregroundColor.color) {
      const color = convertColorToHex(style.foregroundColor.color);
      html = `<span style="color: ${color};">${html}</span>`;
    }
  }

  return html;
}

function convertTableToHtml(table: any): string {
  let html =
    '<table class="w-full border-collapse border border-gray-300 mb-4">';

  if (table.tableRows) {
    for (const row of table.tableRows) {
      html += "<tr>";
      if (row.tableCells) {
        for (const cell of row.tableCells) {
          html += '<td class="border border-gray-300 p-2">';
          if (cell.content) {
            for (const element of cell.content) {
              if (element.paragraph) {
                html += convertParagraphToHtml(element.paragraph);
              }
            }
          }
          html += "</td>";
        }
      }
      html += "</tr>";
    }
  }

  html += "</table>";
  return html;
}

function convertColorToHex(color: any): string {
  if (color.rgbColor) {
    const r = Math.round((color.rgbColor.red || 0) * 255);
    const g = Math.round((color.rgbColor.green || 0) * 255);
    const b = Math.round((color.rgbColor.blue || 0) * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return "#000000"; // Default to black
}

export async function downloadDocument(
  format: "pdf" | "docx",
  docId: string
): Promise<void> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    const mimeType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // Use the provided docId parameter
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=${encodeURIComponent(
        mimeType
      )}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.status === 403) {
      throw new Error("ACCESS_DENIED");
    }

    if (!response.ok) {
      throw new Error(`Failed to download ${format.toUpperCase()}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template.${format === "pdf" ? "pdf" : "docx"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading ${format}:`, error);
    throw error;
  }
}

export function replaceVariablesInTemplate(
  htmlContent: string,
  variables: Record<string, string>
): string {
  let processedContent = htmlContent;

  // Replace variables in double curly braces {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
    processedContent = processedContent.replace(regex, value || "");
  });

  return processedContent;
}

export function extractVariablesFromTemplate(content: string): string[] {
  const variableRegex = /{{(\s*\w+\s*)}}/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}

// Function to create a document with replaced variables for download
// This was a placeholder implementation that's now replaced by the full implementation below

// Function to create a copy of the template document with replaced variables
export async function createProcessedDocument(
  variables: Record<string, string>,
  fileName: string = "Surat",
  templateDocId?: string
): Promise<ProcessedDocument> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  // Get the template document ID from localStorage if not provided
  let docIdToUse = templateDocId;
  if (!docIdToUse) {
    const storedData = localStorage.getItem("letterPreviewData");
    if (storedData) {
      const data = JSON.parse(storedData);
      const letterTypes = await import("@/types/letterTypes");
      const letterTypeData = letterTypes.letterTypes.find(
        (lt) => lt.id === data.letterType
      );
      docIdToUse = letterTypeData?.docId;
    }
  }

  if (!docIdToUse) {
    throw new Error("Template document ID not found");
  }

  try {
    // Step 1: Create a copy of the template document using the correct docId
    const copyResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${docIdToUse}/copy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${fileName} - ${new Date().toLocaleDateString("id-ID")}`,
        }),
      }
    );

    if (copyResponse.status === 403) {
      throw new Error("ACCESS_DENIED");
    }

    if (!copyResponse.ok) {
      throw new Error("Failed to create document copy");
    }

    const copyData = await copyResponse.json();
    const newDocumentId = copyData.id;

    // Step 2: Replace variables in the new document
    await replaceVariablesInDocument(newDocumentId, variables);

    return {
      documentId: newDocumentId,
      title: copyData.name,
      url: `https://docs.google.com/document/d/${newDocumentId}`,
    };
  } catch (error) {
    console.error("Error creating processed document:", error);
    throw error;
  }
}

// Function to replace variables in a Google Docs document
async function replaceVariablesInDocument(
  documentId: string,
  variables: Record<string, string>
): Promise<void> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    // Create batch update requests for each variable
    const requests: any[] = [];

    Object.entries(variables).forEach(([key, value]) => {
      requests.push({
        replaceAllText: {
          containsText: {
            text: `{{${key}}}`,
            matchCase: false,
          },
          replaceText: value || "",
        },
      });

      // Also handle variations with spaces
      requests.push({
        replaceAllText: {
          containsText: {
            text: `{{ ${key} }}`,
            matchCase: false,
          },
          replaceText: value || "",
        },
      });
    });

    // Execute batch update
    if (requests.length > 0) {
      const batchUpdateResponse = await fetch(
        `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests }),
        }
      );

      if (!batchUpdateResponse.ok) {
        const errorData = await batchUpdateResponse.json();
        throw new Error(
          `Failed to update document: ${JSON.stringify(errorData)}`
        );
      }
    }
  } catch (error) {
    console.error("Error replacing variables in document:", error);
    throw error;
  }
}

// Enhanced download function that works with processed document
export async function downloadProcessedDocument(
  documentId: string,
  format: "pdf" | "docx",
  fileName: string = "surat"
): Promise<void> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    const mimeType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=${encodeURIComponent(
        mimeType
      )}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download ${format.toUpperCase()}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading ${format}:`, error);
    throw error;
  }
}

// Function to delete processed document after download (optional cleanup)
export async function deleteProcessedDocument(
  documentId: string
): Promise<void> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.error("Error deleting processed document:", error);
    // Don't throw error for cleanup operations
  }
}
