"use client";

import { useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNotificationsStore, useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { notifications, markAsRead, deleteNotification, markAllAsRead } =
    useNotificationsStore();

  const userNotifications = notifications.filter((n) => n.userId === user?.id);
  const unreadCount = userNotifications.filter((n) => !n.lu).length;

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
          <span className="bg-destructive text-destructive-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-80 duration-200">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto p-0 text-xs"
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
            <CardContent className="max-h-100 overflow-y-auto border-t p-0">
              {userNotifications.length === 0 ? (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  Aucune notification
                </div>
              ) : (
                <div className="flex flex-col">
                  {[...userNotifications].reverse().map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "hover:bg-muted/50 flex flex-col gap-1 border-b p-3 transition-colors last:border-0",
                        !notification.lu && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            !notification.lu && "text-primary"
                          )}
                        >
                          {notification.titre}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          {!notification.lu && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary h-6 w-6"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-6 w-6"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-muted-foreground/70 text-[10px]">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        ò{" "}
                        {new Date(notification.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
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
