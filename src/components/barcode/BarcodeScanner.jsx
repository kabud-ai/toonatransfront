import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScanLine, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BarcodeScanner({ 
  open, 
  onClose, 
  onScan,
  title = "Scan Barcode",
  placeholder = "Enter or scan code..."
}) {
  const [value, setValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onScan(value.trim());
      setValue('');
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    // Detect barcode scanner (rapid key presses ending with Enter)
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-sky-600" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Barcode / Lot Number</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="pr-10"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {scanning ? (
                  <div className="h-5 w-5 relative">
                    <div className="absolute inset-0 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <ScanLine className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Use a barcode scanner or enter manually
            </p>
          </div>

          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className={cn(
                "h-32 w-32 border-4 border-dashed rounded-lg flex items-center justify-center transition-colors",
                scanning ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20" : "border-slate-300 dark:border-slate-700"
              )}>
                <ScanLine className={cn(
                  "h-12 w-12 transition-colors",
                  scanning ? "text-sky-500" : "text-slate-400"
                )} />
              </div>
              {scanning && (
                <div className="absolute inset-0 border-4 border-sky-500 rounded-lg animate-pulse" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-sky-500 hover:bg-sky-600"
              disabled={!value.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}