'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotificationsStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotificationsStore();

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.lu).length;

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => markAllAsRead(user.id)}
                >
                  Tout marquer comme lu
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto p-0 border-t">
              {userNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Aucune notification
                </div>
              ) : (
                <div className="flex flex-col">
                  {[...userNotifications].reverse().map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex flex-col gap-1 p-3 border-b last:border-0 transition-colors hover:bg-muted/50",
                        !notification.lu && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                          "text-sm font-semibold",
                          !notification.lu && "text-primary"
                        )}>
                          {notification.titre}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          {!notification.lu && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-primary"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/70">
                        {new Date(notification.createdAt).toLocaleDateString()} ò {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
