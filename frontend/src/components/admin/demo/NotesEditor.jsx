import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function NotesEditor({ initialNotes, onSave, isLoading }) {
  const [notes, setNotes] = useState(initialNotes || '');

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium leading-6 text-foreground">Internal Notes</h3>
      <Textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add context, call summaries, or action items here..."
        className="min-h-[150px] resize-y"
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <Button 
          onClick={() => onSave(notes)} 
          disabled={isLoading || notes === (initialNotes || '')}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Notes
        </Button>
      </div>
    </div>
  );
}
