import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Bookmark, Share2 } from "lucide-react";

export function SideActions() {
  return (
    <div className="hidden lg:block fixed right-0 top-1/2 transform -translate-y-1/2 px-4">
      <div className="bg-white shadow-md rounded-lg p-4 space-y-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ThumbsUp className="h-5 w-5" />
          <span className="sr-only">Like</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Comment</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bookmark className="h-5 w-5" />
          <span className="sr-only">Bookmark</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 className="h-5 w-5" />
          <span className="sr-only">Share</span>
        </Button>
      </div>
    </div>
  );
}
