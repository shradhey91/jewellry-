
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Add fonts to the editor
const Quill = ReactQuill.Quill;
if (Quill) {
    const Font = Quill.import('formats/font');
    Font.whitelist = ['sans-serif', 'serif', 'monospace', 'georgia', 'helvetica', 'courier-new'];
    Quill.register(Font, true);
}


const modules = {
  toolbar: [
    [{ 'header': ['1', '2', '3', '4', '5', '6', false] }, { 'font': ['sans-serif', 'serif', 'monospace', 'georgia', 'helvetica', 'courier-new'] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' },
    { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <div className="bg-background">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="h-72 mb-12"
      />
    </div>
  );
}

