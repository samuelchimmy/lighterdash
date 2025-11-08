import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Heart, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  likes: number;
  created_at: string;
}

interface TradeCommentsProps {
  tradeId: string;
  marketId: number;
  walletAddress: string;
}

export function TradeComments({ tradeId, marketId, walletAddress }: TradeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
  }, [tradeId]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("trade_comments")
      .select("*")
      .eq("trade_id", tradeId)
      .eq("market_id", marketId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load comments:", error);
      return;
    }

    setComments(data || []);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    const { error } = await supabase
      .from("trade_comments")
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        trade_id: tradeId,
        market_id: marketId,
        comment: newComment
      });

    if (error) {
      toast.error("Failed to add comment");
      return;
    }

    setNewComment("");
    loadComments();
    toast.success("Comment added!");
  };

  const toggleLike = async (commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to like comments");
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const isLiked = likedComments.has(commentId);
    const newLikes = isLiked ? comment.likes - 1 : comment.likes + 1;

    const { error } = await supabase
      .from("trade_comments")
      .update({ likes: newLikes })
      .eq("id", commentId);

    if (error) {
      toast.error("Failed to update like");
      return;
    }

    if (isLiked) {
      likedComments.delete(commentId);
    } else {
      likedComments.add(commentId);
    }

    setLikedComments(new Set(likedComments));
    loadComments();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
          />
          <Button onClick={addComment} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 border rounded-lg">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {comment.user_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">{comment.comment}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => toggleLike(comment.id)}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${likedComments.has(comment.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      {comment.likes}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
