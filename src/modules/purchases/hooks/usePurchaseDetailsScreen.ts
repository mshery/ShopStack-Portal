import { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePurchaseFetch,
  usePurchaseItemsFetch,
  useMarkAsOrdered,
  useReceivePurchase,
  useCancelPurchase,
} from "../api/queries";
import { useVendorFetch } from "@/modules/vendors/api/queries";
import type { AsyncStatus } from "@/shared/types/models";
import { toast } from "react-hot-toast";

export function usePurchaseDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: purchase,
    isLoading: isPurchaseLoading,
    isError: isPurchaseError,
  } = usePurchaseFetch(id!);

  // Fetch related data separately
  const { data: vendor, isLoading: isVendorLoading } = useVendorFetch(
    purchase?.vendorId || "",
  );

  const { data: items, isLoading: isItemsLoading } = usePurchaseItemsFetch(id!);

  const markAsOrderedMutation = useMarkAsOrdered();
  const receivePurchaseMutation = useReceivePurchase();
  const cancelPurchaseMutation = useCancelPurchase();

  const handleMarkAsOrdered = useCallback(async () => {
    if (!purchase) return;
    try {
      await markAsOrderedMutation.mutateAsync(purchase.id);
      toast.success("Purchase marked as ordered");
    } catch (error) {
      toast.error("Failed to update purchase status");
      console.error(error);
    }
  }, [purchase, markAsOrderedMutation]);

  const handleReceive = useCallback(async () => {
    if (!purchase) return;
    try {
      await receivePurchaseMutation.mutateAsync({
        id: purchase.id,
        date: { receivedDate: new Date().toISOString() },
      });
      toast.success("Purchase received and inventory updated");
    } catch (error) {
      toast.error("Failed to receive purchase");
      console.error(error);
    }
  }, [purchase, receivePurchaseMutation]);

  const handleCancel = useCallback(async () => {
    if (!purchase) return;
    if (!confirm("Are you sure you want to cancel this purchase order?"))
      return;

    try {
      await cancelPurchaseMutation.mutateAsync(purchase.id);
      toast.success("Purchase cancelled");
    } catch (error) {
      toast.error("Failed to cancel purchase");
      console.error(error);
    }
  }, [purchase, cancelPurchaseMutation]);

  const isLoading =
    isPurchaseLoading ||
    isVendorLoading ||
    isItemsLoading ||
    markAsOrderedMutation.isPending ||
    receivePurchaseMutation.isPending ||
    cancelPurchaseMutation.isPending;

  const vm = useMemo(() => {
    return {
      purchase,
      vendor,
      items: items || [],
      isLoading,
      canEdit: purchase?.status === "pending",
      canOrder: purchase?.status === "pending",
      canReceive: purchase?.status === "ordered",
      canCancel:
        purchase?.status === "pending" || purchase?.status === "ordered",
    };
  }, [purchase, vendor, items, isLoading]);

  const status: AsyncStatus =
    isPurchaseLoading || isVendorLoading || isItemsLoading
      ? "loading"
      : isPurchaseError || !purchase
        ? "error"
        : "success";

  return {
    status,
    vm,
    actions: {
      markAsOrdered: handleMarkAsOrdered,
      receive: handleReceive,
      cancel: handleCancel,
      goBack: () => navigate("/tenant/purchases"),
    },
  };
}
