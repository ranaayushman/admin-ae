"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  newsletterService,
  NewsletterCampaign,
  NewsletterCampaignStatus,
  NewsletterQueueHealth,
  PreviewTemplateResponse,
  NewsletterTemplate,
  NewsletterTemplateCategory,
} from "@/lib/services/newsletter.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  Loader2,
  Plus,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Ban,
  TestTubeDiagonal,
  Eye,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_TEMPLATE = {
  name: "",
  key: "",
  category: "newsletter" as NewsletterTemplateCategory,
  subjectTemplate: "",
  htmlTemplate: "",
  textTemplate: "",
  variables: "",
  isActive: true,
};

const DEFAULT_CAMPAIGN = {
  name: "",
  templateId: "",
  audienceType: "all-users" as "all-users" | "custom-list",
  recipientEmails: "",
  templateData: "{}",
};

const DEFAULT_PREVIEW_DATA = '{"name":"Amit","exam":"JEE Main 2026"}';

const terminalStatuses: NewsletterCampaignStatus[] = [
  "completed",
  "failed",
  "cancelled",
];

const getStatusVariant = (status: NewsletterCampaignStatus) => {
  if (status === "completed") return "default" as const;
  if (status === "failed" || status === "cancelled") return "destructive" as const;
  if (status === "paused") return "secondary" as const;
  return "outline" as const;
};

const parseRecord = (value: string): Record<string, string | number | boolean> => {
  if (!value.trim()) return {};
  const parsed = JSON.parse(value);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("Expected a JSON object");
  }
  return parsed as Record<string, string | number | boolean>;
};

export default function NewsletterPage() {
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [progressByCampaign, setProgressByCampaign] = useState<Record<string, number>>({});

  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingQueueHealth, setIsCheckingQueueHealth] = useState(false);

  const [templateForm, setTemplateForm] = useState(DEFAULT_TEMPLATE);
  const [campaignForm, setCampaignForm] = useState(DEFAULT_CAMPAIGN);
  const [previewData, setPreviewData] = useState(DEFAULT_PREVIEW_DATA);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplateName, setPreviewTemplateName] = useState("");
  const [previewResult, setPreviewResult] = useState<PreviewTemplateResponse | null>(null);
  const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [queueHealth, setQueueHealth] = useState<NewsletterQueueHealth | null>(null);

  const activeTemplates = useMemo(
    () => templates.filter((template) => template.isActive),
    [templates]
  );

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      const data = await newsletterService.listTemplates();
      setTemplates(data);
    } catch (error: any) {
      toast.error("Failed to load templates", {
        description: error.message,
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoadingCampaigns(true);
      const data = await newsletterService.listCampaigns();
      setCampaigns(data);
    } catch (error: any) {
      toast.error("Failed to load campaigns", {
        description: error.message,
      });
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([fetchTemplates(), fetchCampaigns()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchCampaigns, fetchTemplates]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleCreateTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingTemplate(true);
    try {
      const payload = {
        name: templateForm.name.trim(),
        key: templateForm.key.trim(),
        category: templateForm.category,
        subjectTemplate: templateForm.subjectTemplate,
        htmlTemplate: templateForm.htmlTemplate,
        textTemplate: templateForm.textTemplate || undefined,
        variables: templateForm.variables
          .split(",")
          .map((variable) => variable.trim())
          .filter(Boolean),
        isActive: templateForm.isActive,
      };

      await newsletterService.createTemplate(payload);
      toast.success("Template created");
      setTemplateForm(DEFAULT_TEMPLATE);
      await fetchTemplates();
    } catch (error: any) {
      toast.error("Failed to create template", {
        description: error.message,
      });
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleToggleTemplateStatus = async (
    templateId: string,
    isActive: boolean
  ) => {
    try {
      await newsletterService.updateTemplate(templateId, { isActive });
      setTemplates((previous) =>
        previous.map((template) =>
          template._id === templateId ? { ...template, isActive } : template
        )
      );
      toast.success(`Template ${isActive ? "activated" : "deactivated"}`);
    } catch (error: any) {
      toast.error("Unable to update template", {
        description: error.message,
      });
    }
  };

  const handlePreviewTemplate = async (templateId: string, templateName: string) => {
    setPreviewingTemplateId(templateId);
    try {
      const data = parseRecord(previewData);
      const preview = await newsletterService.previewTemplate(templateId, data);
      setPreviewTemplateName(templateName);
      setPreviewResult(preview);
      setIsPreviewDialogOpen(true);
    } catch (error: any) {
      toast.error("Template preview failed", {
        description: error.message,
      });
    } finally {
      setPreviewingTemplateId(null);
    }
  };

  const handleTestSend = async (templateId: string) => {
    if (!testEmail.trim()) {
      toast.error("Enter a test email address first");
      return;
    }

    try {
      const data = parseRecord(previewData);
      const response = await newsletterService.testSendTemplate(templateId, {
        email: testEmail.trim(),
        recipientName: "QA User",
        data,
      });
      toast.success("Test email sent", {
        description: response.message,
      });
    } catch (error: any) {
      toast.error("Test send failed", {
        description: error.message,
      });
    }
  };

  const handleQueueHealthCheck = async () => {
    try {
      setIsCheckingQueueHealth(true);
      const health = await newsletterService.getQueueHealth();
      setQueueHealth(health);
      toast.success("Queue health fetched", {
        description: health.status,
      });
    } catch (error: any) {
      toast.error("Queue health check failed", {
        description: error.message,
      });
    } finally {
      setIsCheckingQueueHealth(false);
    }
  };

  const handleCreateCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingCampaign(true);
    try {
      const payload = {
        name: campaignForm.name.trim(),
        templateId: campaignForm.templateId,
        audienceType: campaignForm.audienceType,
        recipientEmails:
          campaignForm.audienceType === "custom-list"
            ? campaignForm.recipientEmails
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean)
            : undefined,
        templateData: parseRecord(campaignForm.templateData),
      };

      await newsletterService.createCampaign(payload);
      toast.success("Campaign created as draft");
      setCampaignForm(DEFAULT_CAMPAIGN);
      await fetchCampaigns();
    } catch (error: any) {
      toast.error("Failed to create campaign", {
        description: error.message,
      });
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const refreshCampaignProgress = useCallback(async (campaignId: string) => {
    try {
      const progress = await newsletterService.getCampaignProgress(campaignId);
      setProgressByCampaign((previous) => ({
        ...previous,
        [campaignId]: progress.progressPercent,
      }));
      setCampaigns((previous) =>
        previous.map((campaign) =>
          campaign._id === campaignId
            ? {
                ...campaign,
                status: progress.status,
                totalRecipients: progress.totalRecipients,
                processedCount: progress.processedCount,
                sentCount: progress.sentCount,
                failedCount: progress.failedCount,
              }
            : campaign
        )
      );
    } catch (error: any) {
      toast.error("Could not fetch campaign progress", {
        description: error.message,
      });
    }
  }, []);

  useEffect(() => {
    const activeCampaignIds = campaigns
      .filter((campaign) => ["queued", "sending"].includes(campaign.status))
      .map((campaign) => campaign._id);

    if (activeCampaignIds.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      activeCampaignIds.forEach((campaignId) => {
        refreshCampaignProgress(campaignId);
      });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [campaigns, refreshCampaignProgress]);

  const triggerCampaignAction = async (
    campaignId: string,
    action: "send" | "pause" | "resume" | "cancel"
  ) => {
    try {
      if (action === "send") {
        await newsletterService.sendCampaign(campaignId, {
          chunkSize: 50,
          maxRetries: 2,
          retryDelayMs: 500,
        });
      }
      if (action === "pause") {
        await newsletterService.pauseCampaign(campaignId);
      }
      if (action === "resume") {
        await newsletterService.resumeCampaign(campaignId);
      }
      if (action === "cancel") {
        await newsletterService.cancelCampaign(campaignId);
      }

      toast.success(`Campaign ${action} request sent`);
      await fetchCampaigns();
      await refreshCampaignProgress(campaignId);
    } catch (error: any) {
      toast.error(`Failed to ${action} campaign`, {
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-8 h-8 text-blue-600" />
              Newsletter
            </h1>
            <p className="text-gray-500 mt-1">
              Manage templates, drafts, and newsletter campaign delivery.
            </p>
          </div>
          <Button variant="outline" onClick={refreshAll} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Queue Health
            </CardTitle>
            <CardDescription>
              Check newsletter queue mode and Redis connectivity status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={handleQueueHealthCheck}
              disabled={isCheckingQueueHealth}
            >
              {isCheckingQueueHealth ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              Check Queue Health
            </Button>

            {queueHealth && (
              <div className="rounded-lg border bg-white p-4 text-sm space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={queueHealth.connected ? "default" : "secondary"}>
                    {queueHealth.status}
                  </Badge>
                  <Badge variant="outline">mode: {queueHealth.mode}</Badge>
                  <Badge variant="outline">queue: {queueHealth.queueName}</Badge>
                </div>
                <p>
                  <span className="font-medium">Configured:</span> {String(queueHealth.configured)}
                </p>
                <p>
                  <span className="font-medium">Connected:</span> {String(queueHealth.connected)}
                </p>
                <p className="text-muted-foreground">{queueHealth.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="py-4">
            <CardContent>
              <p className="text-sm text-muted-foreground">Templates</p>
              <p className="text-2xl font-bold mt-1">{templates.length}</p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent>
              <p className="text-sm text-muted-foreground">Active Templates</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{activeTemplates.length}</p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent>
              <p className="text-sm text-muted-foreground">Campaigns</p>
              <p className="text-2xl font-bold mt-1">{campaigns.length}</p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent>
              <p className="text-sm text-muted-foreground">Running</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {campaigns.filter((campaign) => ["queued", "sending"].includes(campaign.status)).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Test</CardTitle>
            <CardDescription>
              Use the same JSON input for preview and test-send requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Test Email</label>
                <Input
                  type="email"
                  placeholder="qa@example.com"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Template Data JSON</label>
                <Textarea
                  rows={4}
                  value={previewData}
                  onChange={(event) => setPreviewData(event.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Template</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTemplate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Template name"
                    value={templateForm.name}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    placeholder="template.key"
                    value={templateForm.key}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        key: event.target.value,
                      }))
                    }
                    required
                  />
                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={templateForm.category}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        category: event.target.value as NewsletterTemplateCategory,
                      }))
                    }
                  >
                    <option value="newsletter">newsletter</option>
                    <option value="invoice">invoice</option>
                    <option value="transactional">transactional</option>
                    <option value="other">other</option>
                  </select>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">Active</span>
                    <Switch
                      checked={templateForm.isActive}
                      onCheckedChange={(checked) =>
                        setTemplateForm((previous) => ({
                          ...previous,
                          isActive: checked,
                        }))
                      }
                    />
                  </div>
                  <Input
                    className="md:col-span-2"
                    placeholder="Subject template"
                    value={templateForm.subjectTemplate}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        subjectTemplate: event.target.value,
                      }))
                    }
                    required
                  />
                  <Textarea
                    className="md:col-span-2"
                    rows={4}
                    placeholder="HTML template"
                    value={templateForm.htmlTemplate}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        htmlTemplate: event.target.value,
                      }))
                    }
                    required
                  />
                  <Textarea
                    className="md:col-span-2"
                    rows={3}
                    placeholder="Text template (optional)"
                    value={templateForm.textTemplate}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        textTemplate: event.target.value,
                      }))
                    }
                  />
                  <Input
                    className="md:col-span-2"
                    placeholder="Variables (comma-separated), e.g. name,exam"
                    value={templateForm.variables}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        variables: event.target.value,
                      }))
                    }
                  />
                  <Button type="submit" disabled={isCreatingTemplate} className="md:w-fit">
                    {isCreatingTemplate ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Template
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template List</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTemplates ? (
                  <div className="py-8 flex items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading templates...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template._id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.key}</TableCell>
                          <TableCell>{template.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={template.isActive ? "default" : "secondary"}>
                                {template.isActive ? "active" : "inactive"}
                              </Badge>
                              <Switch
                                checked={template.isActive}
                                onCheckedChange={(checked) =>
                                  handleToggleTemplateStatus(template._id, checked)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>{template.version || 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewTemplate(template._id, template.name)}
                                disabled={previewingTemplateId === template._id}
                              >
                                {previewingTemplateId === template._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTestSend(template._id)}
                              >
                                <TestTubeDiagonal className="w-4 h-4" />
                                Test Send
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {templates.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No templates found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Campaign name"
                    value={campaignForm.name}
                    onChange={(event) =>
                      setCampaignForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    required
                  />

                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={campaignForm.templateId}
                    onChange={(event) =>
                      setCampaignForm((previous) => ({
                        ...previous,
                        templateId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      Select template
                    </option>
                    {activeTemplates.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={campaignForm.audienceType}
                    onChange={(event) =>
                      setCampaignForm((previous) => ({
                        ...previous,
                        audienceType: event.target.value as "all-users" | "custom-list",
                      }))
                    }
                  >
                    <option value="all-users">all-users</option>
                    <option value="custom-list">custom-list</option>
                  </select>

                  <Input
                    placeholder="recipient1@example.com, recipient2@example.com"
                    value={campaignForm.recipientEmails}
                    onChange={(event) =>
                      setCampaignForm((previous) => ({
                        ...previous,
                        recipientEmails: event.target.value,
                      }))
                    }
                    disabled={campaignForm.audienceType !== "custom-list"}
                  />

                  <Textarea
                    className="md:col-span-2"
                    rows={4}
                    value={campaignForm.templateData}
                    onChange={(event) =>
                      setCampaignForm((previous) => ({
                        ...previous,
                        templateData: event.target.value,
                      }))
                    }
                    placeholder='Template data JSON, e.g. {"exam":"NEET"}'
                  />

                  <Button type="submit" className="md:w-fit" disabled={isCreatingCampaign}>
                    {isCreatingCampaign ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Campaign
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign List</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="py-8 flex items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading campaigns...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Sent / Failed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => {
                        const progress =
                          progressByCampaign[campaign._id] ??
                          (campaign.totalRecipients > 0
                            ? Math.round(
                                (campaign.processedCount / campaign.totalRecipients) * 100
                              )
                            : 0);
                        const canSend = campaign.status === "draft";
                        const canPause = ["queued", "sending"].includes(campaign.status);
                        const canResume = campaign.status === "paused";
                        const canCancel = !terminalStatuses.includes(campaign.status);

                        return (
                          <TableRow key={campaign._id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                            </TableCell>
                            <TableCell>{campaign.audienceType}</TableCell>
                            <TableCell>{campaign.totalRecipients > 0 ? `${progress}%` : "-"}</TableCell>
                            <TableCell>
                              {campaign.sentCount} / {campaign.failedCount}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => refreshCampaignProgress(campaign._id)}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Track
                                </Button>
                                {canSend && (
                                  <Button
                                    size="sm"
                                    onClick={() => triggerCampaignAction(campaign._id, "send")}
                                  >
                                    <Play className="w-4 h-4" />
                                    Send
                                  </Button>
                                )}
                                {canPause && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => triggerCampaignAction(campaign._id, "pause")}
                                  >
                                    <Pause className="w-4 h-4" />
                                    Pause
                                  </Button>
                                )}
                                {canResume && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => triggerCampaignAction(campaign._id, "resume")}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                    Resume
                                  </Button>
                                )}
                                {canCancel && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => triggerCampaignAction(campaign._id, "cancel")}
                                  >
                                    <Ban className="w-4 h-4" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {campaigns.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No campaigns found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
              <DialogDescription>
                {previewTemplateName ? `Rendered output for ${previewTemplateName}` : "Rendered template output"}
              </DialogDescription>
            </DialogHeader>

            {previewResult && (
              <div className="space-y-4 max-h-[70vh] overflow-auto">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Subject</p>
                  <p className="mt-1 text-sm font-semibold">{previewResult.subject}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">HTML Preview</p>
                  <div
                    className="mt-1 rounded-md border bg-white p-4 text-sm"
                    dangerouslySetInnerHTML={{ __html: previewResult.html || "" }}
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Plain Text</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-xs">
                    {previewResult.text || "-"}
                  </pre>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Used Variables</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previewResult.usedVariables?.length ? (
                      previewResult.usedVariables.map((variable) => (
                        <Badge key={variable} variant="outline">
                          {variable}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No variables used in this render</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
