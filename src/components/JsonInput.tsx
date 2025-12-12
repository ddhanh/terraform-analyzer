import { useState, useRef } from 'react';
import { Upload, FileJson, Clipboard, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface JsonInputProps {
  onAnalyze: (json: string) => void;
  error?: string | null;
}

export function JsonInput({ onAnalyze, error }: JsonInputProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFileUpload(file);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
          error && 'border-destructive'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Textarea
          placeholder={`{
  "format_version": "1.2",
  "terraform_version": "1.6.0",
  "resource_changes": [
    {
      "address": "aws_instance.web[0]",
      "type": "aws_instance",
      "name": "web",
      "change": {
        "actions": ["create"],
        "before": null,
        "after": {
          "instance_type": "t3.large",
          "ami": "ami-0c55b159cbfafe1f0"
        }
      }
    }
  ]
}`}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className={cn(
            'min-h-[200px] font-mono text-sm bg-transparent border-none resize-none',
            'focus-visible:ring-0 focus-visible:ring-offset-0'
          )}
        />

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg">
            <div className="text-center">
              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-primary font-medium">Drop JSON file here</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <FileJson className="w-4 h-4" />
          Upload JSON
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePaste}
          className="gap-2"
        >
          <Clipboard className="w-4 h-4" />
          Paste from Clipboard
        </Button>

        <Button
          size="sm"
          onClick={() => onAnalyze(jsonInput)}
          disabled={!jsonInput.trim()}
          className="gap-2 ml-auto"
        >
          <Play className="w-4 h-4" />
          Analyze Plan
        </Button>
      </div>
    </div>
  );
}
