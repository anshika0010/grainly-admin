"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
    () =>
        import("@tinymce/tinymce-react").then(
            (mod) => mod.Editor
        ),
    {
        ssr: false,
    }
);

export default function BlogEditor({
    blogForm,
    handleInputChange,
    editorRef,
}) {
    return (
        <Editor
            id="blog-content"
            value={blogForm.content || ""}
            licenseKey="gpl"
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            onInit={(event, editor) => {
                if (editorRef) {
                    editorRef.current = editor;
                }
            }}
            onEditorChange={(content) =>
                handleInputChange("content", content)
            }
            init={{
                height: 400,

                menubar:
                    "file edit view insert format tools table help",

                plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
                ],

                toolbar:
                    "undo redo | " +
                    "blocks fontfamily fontsize | " +
                    "bold italic underline strikethrough | " +
                    "alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist | " +
                    "link image media table | " +
                    "removeformat",

                font_family_formats:
                    "System Font=system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
                    "Arial=Arial,Helvetica,sans-serif;" +
                    "Georgia=Georgia,serif;" +
                    "Times New Roman=Times New Roman,Times,serif;" +
                    "Verdana=Verdana,sans-serif",

                fontsize_formats:
                    "8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt",

                branding: false,
                promotion: false,

                content_style: `
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        padding: 12px;
                        color: #111827;
                    }

                    p {
                        margin: 0 0 10px;
                    }

                    h1 {
                        font-size: 32px;
                        font-weight: 700;
                    }

                    h2 {
                        font-size: 26px;
                        font-weight: 700;
                    }

                    h3 {
                        font-size: 22px;
                        font-weight: 600;
                    }

                    ul,
                    ol {
                        padding-left: 25px;
                    }

                    img {
                        max-width: 100%;
                        height: auto;
                    }

                    a {
                        color: #2563eb;
                        text-decoration: underline;
                    }
                `,
            }}
        />
    );
}
