/**
 * Expiry Alerts Widget
 *
 * Displays products with batches expiring soon.
 * Shows 7-day alert by default (configurable).
 */

import { useMemo } from "react";
import {
  useExpiringBatches,
  useExpiredBatches,
} from "@/modules/inventory/api/batchesQueries";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ExpiryAlertsWidgetProps {
  expiryDays?: number;
  showExpired?: boolean;
  maxItems?: number;
}

export function ExpiryAlertsWidget({
  expiryDays = 7,
  showExpired = true,
  maxItems = 5,
}: ExpiryAlertsWidgetProps) {
  const { data: expiringBatches, isLoading: loadingExpiring } =
    useExpiringBatches(expiryDays);
  const { data: expiredBatches, isLoading: loadingExpired } =
    useExpiredBatches();

  const isLoading = loadingExpiring || loadingExpired;

  const alerts = useMemo(() => {
    const items: Array<{
      id: string;
      productName: string;
      batchNumber: string;
      quantity: number;
      expiryDate: Date;
      status: "expired" | "expiring";
    }> = [];

    // Add expired batches first (higher priority)
    if (showExpired && expiredBatches) {
      expiredBatches.slice(0, maxItems).forEach((batch) => {
        items.push({
          id: batch.id,
          productName: batch.product?.name || "Unknown Product",
          batchNumber: batch.batchNumber,
          quantity: Number(batch.quantity),
          expiryDate: new Date(batch.expiryDate!),
          status: "expired",
        });
      });
    }

    // Add expiring batches
    if (expiringBatches) {
      const remaining = maxItems - items.length;
      expiringBatches.slice(0, remaining).forEach((batch) => {
        items.push({
          id: batch.id,
          productName: batch.product?.name || "Unknown Product",
          batchNumber: batch.batchNumber,
          quantity: Number(batch.quantity),
          expiryDate: new Date(batch.expiryDate!),
          status: "expiring",
        });
      });
    }

    return items;
  }, [expiringBatches, expiredBatches, showExpired, maxItems]);

  const totalAlerts =
    (expiringBatches?.length || 0) + (expiredBatches?.length || 0);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 dark:bg-gray-800 rounded"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-sm">Expiry Alerts</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No products expiring within {expiryDays} days 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-sm">Expiry Alerts</h3>
          </div>
          {totalAlerts > maxItems && (
            <Badge variant="secondary" className="text-xs">
              +{totalAlerts - maxItems} more
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border ${
                alert.status === "expired"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {alert.status === "expired" ? (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {alert.productName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Batch: {alert.batchNumber} • Qty: {alert.quantity}
                  </p>
                </div>
              </div>
              <Badge
                variant={alert.status === "expired" ? "error" : "outline"}
                className="text-xs flex-shrink-0 ml-2"
              >
                {alert.status === "expired"
                  ? "Expired"
                  : formatDistanceToNow(alert.expiryDate, { addSuffix: true })}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ExpiryAlertsWidget;
