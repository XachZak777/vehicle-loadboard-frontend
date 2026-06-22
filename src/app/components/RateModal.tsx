import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { colors } from '../styles/colors';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useSubmitRatingMutation } from '../store/services/hauliusApi';

const BROKER_POSITIVE_TAGS = [
  { id: 'communication', label: 'Proper Communication', sub: 'Clear and timely responses' },
  { id: 'payment', label: 'On-Time Payment', sub: 'Paid promptly as agreed' },
  { id: 'accuracy', label: 'Accurate Load Details', sub: 'Description matched actual load' },
];

const BROKER_NEGATIVE_TAGS = [
  { id: 'communication', label: 'Poor Communication', sub: 'Slow or unclear responses' },
  { id: 'payment', label: 'Late Payment', sub: 'Payment was delayed' },
  { id: 'accuracy', label: 'Inaccurate Load Details', sub: 'Description did not match load' },
];

const CARRIER_POSITIVE_TAGS = [
  { id: 'on_time', label: 'On-Time Pickup & Delivery', sub: 'Arrived and delivered as scheduled' },
  { id: 'safe_delivery', label: 'Vehicle Delivered Safely', sub: 'No damage, vehicle in expected condition' },
  { id: 'professional', label: 'Professional Service', sub: 'Responsive, courteous, and reliable' },
];

const CARRIER_NEGATIVE_TAGS = [
  { id: 'on_time', label: 'Late Pickup or Delivery', sub: 'Did not meet the agreed schedule' },
  { id: 'safe_delivery', label: 'Vehicle Damage', sub: 'Vehicle arrived damaged or in poor condition' },
  { id: 'professional', label: 'Unprofessional Conduct', sub: 'Unresponsive, rude, or unreliable' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  targetId: string;
  targetType: 'broker' | 'carrier';
  targetName: string;
  loadId: string;
  vehicleTitle: string;
}

export function RateModal({ open, onClose, onSubmitted, targetId, targetType, targetName, loadId, vehicleTitle }: Props) {
  const [submitRating, { isLoading }] = useSubmitRatingMutation();
  const [ratingType, setRatingType] = useState<'positive' | 'negative' | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const positiveTags = targetType === 'carrier' ? CARRIER_POSITIVE_TAGS : BROKER_POSITIVE_TAGS;
  const negativeTags = targetType === 'carrier' ? CARRIER_NEGATIVE_TAGS : BROKER_NEGATIVE_TAGS;
  const tags = ratingType === 'positive' ? positiveTags : negativeTags;

  const handleTypeSelect = (type: 'positive' | 'negative') => {
    setRatingType(type);
    setSelectedTags([]);
  };

  const toggleTag = (id: string) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!ratingType) return;
    try {
      await submitRating({
        targetId,
        targetType,
        loadId,
        type: ratingType,
        tags: selectedTags,
        comment: comment.trim() || undefined,
      }).unwrap();
      toast.success('Rating submitted successfully');
      onSubmitted();
      handleClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Please try again.';
      toast.error('Failed to submit rating', { description: msg });
    }
  };

  const handleClose = () => {
    setRatingType(null);
    setSelectedTags([]);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-[calc(100vw-24px)] sm:max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className={`flex-shrink-0 size-12 rounded-xl ${colors.accentBgLightDual} flex items-center justify-center`}>
            <Star className={`size-6 ${colors.accentText}`} />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Rate Your Experience</DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Help the community by sharing feedback about{' '}
              <span className="font-semibold text-foreground">{targetName}</span>
            </p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Load details */}
          <div className="bg-muted rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Load Details</p>
            <p className="font-semibold text-sm">{vehicleTitle}</p>
          </div>

          {/* Rating type */}
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Star className={`size-4 ${colors.accentText}`} />
              How was your experience? <span className={colors.errorText}>*</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTypeSelect('positive')}
                className={`relative flex flex-col items-center gap-3 rounded-xl border-2 py-6 transition-all ${
                  ratingType === 'positive'
                    ? `${colors.accentBorder} ${colors.accentBgFaint} dark:bg-amber-900/20`
                    : `border-border bg-background hover:${colors.accentBorderFaint} hover:bg-amber-50/50 dark:hover:bg-amber-900/10`
                }`}
              >
                {ratingType === 'positive' && (
                  <span className={`absolute top-2 right-2 size-5 rounded-full border-2 ${colors.accentBorder} bg-background flex items-center justify-center`}>
                    <CheckCircle className={`size-3.5 ${colors.accentText} fill-amber-500`} />
                  </span>
                )}
                <span className={`size-14 rounded-full flex items-center justify-center transition-colors ${ratingType === 'positive' ? colors.accentBg : 'bg-muted'}`}>
                  <ThumbsUp className={`size-7 ${ratingType === 'positive' ? 'text-white' : 'text-muted-foreground'}`} />
                </span>
                <span className={`font-semibold text-base ${ratingType === 'positive' ? colors.accentTextStrong : 'text-muted-foreground'}`}>Positive</span>
                <span className="text-xs text-muted-foreground">Great experience</span>
              </button>

              <button
                onClick={() => handleTypeSelect('negative')}
                className={`relative flex flex-col items-center gap-3 rounded-xl border-2 py-6 transition-all ${
                  ratingType === 'negative'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-border bg-background hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/10'
                }`}
              >
                {ratingType === 'negative' && (
                  <span className="absolute top-2 right-2 size-5 rounded-full border-2 border-red-500 bg-background flex items-center justify-center">
                    <CheckCircle className="size-3.5 text-red-500 fill-red-500" />
                  </span>
                )}
                <span className={`size-14 rounded-full flex items-center justify-center transition-colors ${ratingType === 'negative' ? 'bg-red-500' : 'bg-muted'}`}>
                  <ThumbsDown className={`size-7 ${ratingType === 'negative' ? 'text-white' : 'text-muted-foreground'}`} />
                </span>
                <span className={`font-semibold text-base ${ratingType === 'negative' ? colors.errorText : 'text-muted-foreground'}`}>Negative</span>
                <span className="text-xs text-muted-foreground">Had issues</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {ratingType && (
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <CheckCircle className={`size-4 ${colors.accentText}`} />
                {ratingType === 'positive' ? 'What went well?' : 'What went wrong?'}
                <span className="text-muted-foreground font-normal">(Optional)</span>
              </p>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="mt-0.5 size-4 rounded accent-amber-500"
                    />
                    <div>
                      <p className="text-sm font-medium">{tag.label}</p>
                      <p className="text-xs text-muted-foreground">{tag.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <MessageSquare className={`size-4 ${colors.accentText}`} />
              Share Your Experience
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Tell us more about your experience with this company. Your feedback helps others make informed decisions..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/500 characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={!ratingType || isLoading}
            className={`flex-1 ${colors.accentBtn} font-semibold`}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Send className="size-4 mr-2" />}
            Submit Rating
          </Button>
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
