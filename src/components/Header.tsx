import { FileJson, Github, Terminal } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Terraform Plan Analyzer</h1>
              <p className="text-xs text-muted-foreground font-mono">Risk Assessment</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <a
              href="https://developer.hashicorp.com/terraform/cli/commands/show"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>terraform show -json</span>
            </a>
            <a
              href="https://github.com/ddhanh/terraform-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
