import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';
import { useTranslation } from '@/components/i18n/LanguageContext';
import { WIDGET_CATALOG } from './WidgetLibrary';
import { Badge } from '@/components/ui/badge';

export default function WidgetCustomizer({ selectedWidgets, onSave, userRole }) {
  const { t } = useTranslation();
  const [tempSelection, setTempSelection] = useState(selectedWidgets);
  const [open, setOpen] = useState(false);

  // Determine user role category for filtering
  const roleCategory = userRole?.code || 'director';

  // Filter widgets relevant to user role
  const relevantWidgets = WIDGET_CATALOG.filter(widget => 
    widget.roles.includes(roleCategory) || widget.roles.includes('director')
  );

  const handleToggle = (widgetId) => {
    setTempSelection(prev => {
      if (prev.includes(widgetId)) {
        return prev.filter(id => id !== widgetId);
      } else {
        return [...prev, widgetId];
      }
    });
  };

  const handleSave = () => {
    onSave(tempSelection);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultWidgets = relevantWidgets.slice(0, 4).map(w => w.id);
    setTempSelection(defaultWidgets);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          {t('dashboard.customize_widgets')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dashboard.customize_dashboard')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            {t('dashboard.select_widgets_to_display')}
          </p>
          
          <div className="grid gap-3">
            {relevantWidgets.map(widget => (
              <div 
                key={widget.id} 
                className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  id={widget.id}
                  checked={tempSelection.includes(widget.id)}
                  onCheckedChange={() => handleToggle(widget.id)}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={widget.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {t(widget.title)}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(widget.description)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {widget.defaultSize === 'small' ? t('dashboard.small') : 
                       widget.defaultSize === 'medium' ? t('dashboard.medium') : t('dashboard.large')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              {t('dashboard.reset_defaults')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}