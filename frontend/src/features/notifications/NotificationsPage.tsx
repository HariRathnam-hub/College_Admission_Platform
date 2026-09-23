import { Bell, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "./notifications.api";

export default function NotificationsPage() {
  const { data, isLoading } = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay up to date on your application activity.</p>
        </div>
        {!!data?.unreadCount && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading notifications…</p>}

      {data?.notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You're all caught up — no notifications yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {data?.notifications.map((notification) => (
          <Card
            key={notification._id}
            className={cn(!notification.isRead && "border-primary/40 bg-primary/5")}
          >
            <CardContent className="flex items-start justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {!notification.isRead && (
                <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification._id)}>
                  Mark read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
