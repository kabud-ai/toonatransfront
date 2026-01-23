import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  AlertTriangle,
  Package,
  Wrench,
  ClipboardCheck,
  ShoppingCart,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => base44.entities.StockLevel.list()
  });

  const { data: maintenanceOrders = [] } = useQuery({
    queryKey: ['maintenanceOrders'],
    queryFn: () => base44.entities.MaintenanceOrder.list()
  });

  const { data: qualityInspections = [] } = useQuery({
    queryKey: ['qualityInspections'],
    queryFn: () => base44.entities.QualityInspection.list()
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => base44.entities.PurchaseOrder.list()
  });

  useEffect(() => {
    const newNotifications = [];

    // Low stock alerts
    const lowStock = stockLevels.filter(s => s.quantity < 10);
    lowStock.forEach(item => {
      newNotifications.push({
        id: `stock-${item.id}`,
        type: 'alert',
        title: 'Low Stock Alert',
        message: `${item.product_name} is running low (${item.quantity} units)`,
        icon: AlertTriangle,
        color: 'amber',
        timestamp: new Date(),
        link: '/Inventory'
      });
    });

    // Maintenance due
    const maintenanceDue = maintenanceOrders.filter(m => 
      m.status === 'scheduled' && 
      new Date(m.scheduled_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    maintenanceDue.forEach(order => {
      newNotifications.push({
        id: `maintenance-${order.id}`,
        type: 'warning',
        title: 'Maintenance Due',
        message: `${order.equipment_name} - ${order.description}`,
        icon: Wrench,
        color: 'purple',
        timestamp: new Date(order.scheduled_date),
        link: '/MaintenanceOrders'
      });
    });

    // Pending quality inspections
    const pendingInspections = qualityInspections.filter(q => q.status === 'pending');
    if (pendingInspections.length > 0) {
      newNotifications.push({
        id: 'quality-pending',
        type: 'info',
        title: 'Pending Quality Inspections',
        message: `${pendingInspections.length} inspections awaiting review`,
        icon: ClipboardCheck,
        color: 'cyan',
        timestamp: new Date(),
        link: '/QualityInspections'
      });
    }

    // Pending purchase orders
    const pendingPurchases = purchaseOrders.filter(p => p.status === 'draft' || p.status === 'sent');
    if (pendingPurchases.length > 0) {
      newNotifications.push({
        id: 'purchase-pending',
        type: 'info',
        title: 'Pending Purchase Orders',
        message: `${pendingPurchases.length} orders need attention`,
        icon: ShoppingCart,
        color: 'blue',
        timestamp: new Date(),
        link: '/PurchaseOrders'
      });
    }

    setNotifications(newNotifications.sort((a, b) => b.timestamp - a.timestamp));
    setUnreadCount(newNotifications.length);
  }, [stockLevels, maintenanceOrders, qualityInspections, purchaseOrders]);

  const markAsRead = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getColorClass = (color) => {
    const colors = {
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-sky-600 hover:text-sky-700"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div 
                    key={notification.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        getColorClass(notification.color)
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <p className="text-xs text-slate-500">
                            {format(notification.timestamp, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}