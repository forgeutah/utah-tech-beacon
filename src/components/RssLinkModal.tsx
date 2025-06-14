
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RssLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroups: string[];
  selectedTags: string[];
  groups: Array<{ id: string; name: string }>;
  generateRssUrl: () => string;
}

export default function RssLinkModal({
  open,
  onOpenChange,
  selectedGroups,
  selectedTags,
  groups,
  generateRssUrl,
}: RssLinkModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    const url = generateRssUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "URL copied!",
        description: "The RSS feed URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleOpenFeed = () => {
    const url = generateRssUrl();
    window.open(url, '_blank');
  };

  const getSelectedGroupNames = () => {
    if (selectedGroups.length === 0) return "All groups";
    return groups
      .filter(group => selectedGroups.includes(group.id))
      .map(group => group.name)
      .join(", ");
  };

  const getSelectedTagsText = () => {
    if (selectedTags.length === 0) return "All tags";
    return selectedTags.join(", ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>RSS Feed Link</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Applied Filters:</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Groups:</span> {getSelectedGroupNames()}
              </div>
              <div>
                <span className="font-medium">Tags:</span> {getSelectedTagsText()}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">RSS Feed URL:</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-muted rounded text-xs break-all">
                {generateRssUrl()}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleOpenFeed} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open RSS Feed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
