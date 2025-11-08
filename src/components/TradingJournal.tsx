import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { LighterTrade } from '@/types/lighter';
import { Save, X, Plus } from 'lucide-react';

interface TradingJournalProps {
  trades: LighterTrade[];
  walletAddress: string;
  userId: string;
}

interface TradeNote {
  id: string;
  trade_id: string;
  note: string;
  tags: string[];
}

export const TradingJournal = ({ trades, walletAddress, userId }: TradingJournalProps) => {
  const [notes, setNotes] = useState<Map<string, TradeNote>>(new Map());
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, [userId, walletAddress]);

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('trade_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error loading notes:', error);
      return;
    }

    const notesMap = new Map<string, TradeNote>();
    data?.forEach(note => {
      notesMap.set(note.trade_id, {
        id: note.id,
        trade_id: note.trade_id,
        note: note.note || '',
        tags: note.tags || [],
      });
    });
    setNotes(notesMap);
  };

  const saveNote = async (tradeId: string, marketId: number) => {
    const existing = notes.get(tradeId);

    const noteData = {
      user_id: userId,
      wallet_address: walletAddress,
      trade_id: tradeId,
      market_id: marketId,
      note: currentNote,
      tags: currentTags,
    };

    try {
      if (existing) {
        const { error } = await supabase
          .from('trade_notes')
          .update(noteData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trade_notes')
          .insert([noteData]);

        if (error) throw error;
      }

      toast({
        title: "Note saved",
        description: "Your trading note has been saved successfully.",
      });

      loadNotes();
      setEditingTradeId(null);
      setCurrentNote('');
      setCurrentTags([]);
    } catch (error: any) {
      toast({
        title: "Error saving note",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEditing = (trade: LighterTrade) => {
    const existing = notes.get(trade.trade_id.toString());
    setEditingTradeId(trade.trade_id.toString());
    setCurrentNote(existing?.note || '');
    setCurrentTags(existing?.tags || []);
  };

  const addTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setCurrentTags([...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setCurrentTags(currentTags.filter(t => t !== tag));
  };

  return (
    <Card className="p-6 bg-card border-border shadow-card hover-glow-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Trading Journal</h3>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {trades.slice(0, 20).map((trade) => {
          const tradeId = trade.trade_id.toString();
          const existing = notes.get(tradeId);
          const isEditing = editingTradeId === tradeId;

          return (
            <div key={tradeId} className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-foreground">Trade #{tradeId}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {new Date(trade.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(trade)}
                  >
                    {existing ? 'Edit' : 'Add Note'}
                  </Button>
                )}
              </div>

              {existing && !isEditing && (
                <div className="space-y-2">
                  <p className="text-sm text-foreground">{existing.note}</p>
                  <div className="flex flex-wrap gap-2">
                    {existing.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="space-y-3 mt-3">
                  <Textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Add your trading notes..."
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTradeId(null);
                        setCurrentNote('');
                        setCurrentTags([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveNote(tradeId, trade.market_id)}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
