import { useState } from "react";
import { Header } from "@/components/Header";
import { JsonInput } from "@/components/JsonInput";
import { RiskGauge } from "@/components/RiskGauge";
import { SummaryStats } from "@/components/SummaryStats";
import { CostCard } from "@/components/CostCard";
import { ActionChart } from "@/components/ActionChart";
import { WarningsList } from "@/components/WarningsList";
import { ResourceList } from "@/components/ResourceList";
import { analyzePlan } from "@/lib/riskAnalyzer";
import { mockTerraformPlan } from "@/lib/mockData";
import { PlanAnalysis, TerraformPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, FileCode2, Code, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [analysis, setAnalysis] = useState<PlanAnalysis | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [rawJson, setRawJson] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = (jsonString: string) => {
    try {
      setParseError(null);
      const parsed = JSON.parse(jsonString) as TerraformPlan;

      if (!parsed.resource_changes) {
        setParseError('Invalid Terraform plan: missing "resource_changes" field');
        return;
      }

      const result = analyzePlan(parsed);
      setAnalysis(result);
      setRawJson(jsonString);
      setShowInput(false);
    } catch (err) {
      setParseError("Invalid JSON: " + (err instanceof Error ? err.message : "Parse error"));
    }
  };

  const handleLoadDemo = () => {
    const result = analyzePlan(mockTerraformPlan);
    setAnalysis(result);
    setRawJson(JSON.stringify(mockTerraformPlan, null, 2));
    setShowInput(false);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setShowInput(true);
    setParseError(null);
    setRawJson("");
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={handleReset} />

      <main className="container mx-auto px-4 py-8">
        {showInput ? (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Hero section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">Analyze Your Terraform Plan</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Paste your{" "}
                <code className="px-1.5 py-0.5 bg-muted rounded font-mono text-sm">terraform show -json</code> output to
                get instant risk analysis, cost estimation, and actionable insights.
              </p>
            </div>

            {/* Input card */}
            <div className="glass-card p-6">
              <JsonInput onAnalyze={handleAnalyze} error={parseError} />
            </div>

            {/* Demo button */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Don't have a plan file? Try with sample data:</p>
              <Button onClick={handleLoadDemo} variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                Load Demo Data
              </Button>
            </div>

            {/* Features grid */}
            <div className="grid md:grid-cols-3 gap-4 mt-12">
              {[
                {
                  title: "Risk Detection",
                  description: "Identify dangerous operations, stateful resource deletions, and production impacts",
                },
                {
                  title: "Cost Estimation",
                  description: "Calculate AWS monthly cost changes using a static price chart, for reference only",
                },
                {
                  title: "Policy Checks",
                  description: "Detect IAM escalations, security group widening, and lifecycle issues",
                },
              ].map((feature) => (
                <div key={feature.title} className="glass-card p-5 text-center">
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          analysis && (
            <div className="space-y-6 animate-fade-in">
              {/* Top bar with reset */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FileCode2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Analysis Results</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Code className="w-4 h-4 mr-1" />
                        View Source JSON
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                          <span>Source Terraform Plan</span>
                          <Button variant="ghost" size="sm" onClick={handleCopyJson}>
                            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="overflow-auto max-h-[60vh] bg-muted/50 rounded-lg p-4">
                        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">{rawJson}</pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Analyze Another Plan
                  </Button>
                </div>
              </div>

              {/* Summary row */}
              <SummaryStats analysis={analysis} />

              {/* Main dashboard grid */}
              <div className="grid lg:grid-cols-3 gap-6 auto-rows-fr">
                {/* Risk Gauge */}
                <div className="glass-card p-5 flex flex-col">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Overall Risk Score
                  </h3>
                  <div className="flex-1 flex items-center justify-center">
                    <RiskGauge score={analysis.overallRiskScore} level={analysis.overallRiskLevel} />
                  </div>
                </div>

                {/* Cost Card */}
                <CostCard
                  before={analysis.totalCostBefore}
                  after={analysis.totalCostAfter}
                  delta={analysis.costDelta}
                  percentChange={analysis.costPercentChange}
                  costAvailable={analysis.costAvailable}
                />

                {/* Actions Chart */}
                <ActionChart analysis={analysis} />
              </div>

              {/* Warnings */}
              <WarningsList criticalIssues={analysis.criticalIssues} warnings={analysis.warnings} />

              {/* Resource List */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Resource Changes</h2>
                <ResourceList resources={analysis.resources} />
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-xs text-muted-foreground">
            • Terraform Plan Analyzer • Cost estimates may be outdated •
          </p>
        </div>
      </footer>
    </div>
  );
}
